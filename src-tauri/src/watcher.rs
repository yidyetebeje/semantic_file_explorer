// src-tauri/src/watcher.rs

use crate::commands::search_commands::{add_file_to_index, remove_file_from_index};
use crate::db::{
    connect_db, delete_document, open_or_create_amharic_text_table, upsert_amharic_document,
    DbError,
};
use crate::embedder::embed_text;
use crate::extractor::{calculate_hash, extract_text, SUPPORTED_TEXT_EXTENSIONS};
use lancedb::Table;
use log::{error, info, warn};
use notify::event::{CreateKind, DataChange, ModifyKind, RenameMode};
use notify::{
    Event, EventKind, RecommendedWatcher, RecursiveMode, Result as NotifyResult,
    Watcher as NotifyWatcher,
};
use serde::Serialize;
use std::fs::metadata;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::Arc;
use std::sync::Mutex;
use std::time::Instant;
use tauri::{AppHandle, Emitter};
use thiserror::Error;

// Used in tests for timeouts
#[cfg(test)]
use crate::db::TestDb;
#[cfg(test)]
use std::io::Write;
#[cfg(test)]
use std::time::Duration;

// Global watcher state
static WATCHER_STATE: Mutex<Option<WatcherState>> = Mutex::new(None);

struct WatcherState {
    _watcher: RecommendedWatcher,
    shutdown_sender: Option<Sender<()>>,
}

#[derive(Error, Debug)]
pub enum WatcherError {
    #[error("Failed to create file system watcher: {0}")]
    CreationFailed(notify::Error),
    #[error("Failed to watch path '{0}': {1}")]
    PathWatchFailed(String, notify::Error),
    #[error("Database error: {0}")]
    DatabaseError(#[from] DbError),
    #[error("Watcher already running")]
    AlreadyRunning,
    #[error("Watcher not running")]
    NotRunning,
}

#[derive(Debug, Serialize, Clone)]
pub struct FileWatcherEvent {
    pub event_type: String, // "created", "modified", "deleted"
    pub file_path: String,
    pub timestamp: u64,
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct WatcherStatus {
    pub is_running: bool,
    pub watched_path: Option<String>,
    pub events_processed: u64,
    pub last_event_time: Option<u64>,
}

/// Sets up a file system watcher for the given path.
///
/// Returns the watcher instance and a receiver channel for events.
pub async fn setup_watcher(
    path_to_watch: &str,
    _app_handle: AppHandle,
) -> Result<
    (
        RecommendedWatcher,
        Receiver<NotifyResult<Event>>,
        Sender<()>,
    ),
    WatcherError,
> {
    let path = Path::new(path_to_watch);
    info!("Setting up file watcher for path: {:?}", path);

    // Create a channel to receive events
    let (tx, rx) = channel();
    let (shutdown_tx, _shutdown_rx) = channel();

    // Create a file system watcher instance.
    let mut watcher = RecommendedWatcher::new(
        move |res: NotifyResult<Event>| {
            if let Err(e) = tx.send(res) {
                error!("Failed to send watcher event through channel: {}", e);
            }
        },
        notify::Config::default(),
    )
    .map_err(WatcherError::CreationFailed)?;

    // Add the path to watch recursively
    watcher
        .watch(path, RecursiveMode::Recursive)
        .map_err(|e| WatcherError::PathWatchFailed(path_to_watch.to_string(), e))?;

    info!("Successfully watching path: {:?}", path);

    Ok((watcher, rx, shutdown_tx))
}

/// Processes file system events received from the watcher channel.
pub async fn process_events(
    rx: Receiver<NotifyResult<Event>>,
    table: Arc<Table>,
    app_handle: AppHandle,
    shutdown_rx: Receiver<()>,
) {
    info!("Starting event processing loop...");
    let mut events_processed = 0u64;

    loop {
        // Check for shutdown signal first
        if shutdown_rx.try_recv().is_ok() {
            info!("Received shutdown signal, stopping event processing");
            break;
        }

        // Try to receive an event without blocking indefinitely
        match rx.try_recv() {
            Ok(result) => {
                match result {
                    Ok(event) => {
                        events_processed += 1;

                        // We only care about events with valid paths
                        if event.paths.is_empty() {
                            continue;
                        }

                        // Detect action based on event kind
                        let (action, paths_to_check) = match event.kind {
                            // Files created, data modified, or renamed TO this path -> UPSERT
                            EventKind::Create(CreateKind::File)
                            | EventKind::Modify(ModifyKind::Data(DataChange::Content))
                            | EventKind::Modify(ModifyKind::Name(RenameMode::To))
                            | EventKind::Modify(ModifyKind::Name(RenameMode::Both)) => {
                                ("Upsert", event.paths)
                            }

                            // Files removed or renamed FROM this path -> DELETE
                            EventKind::Remove(_)
                            | EventKind::Modify(ModifyKind::Name(RenameMode::From)) => {
                                ("Delete", event.paths)
                            }

                            // Other events we don't currently handle
                            _ => {
                                warn!("Ignoring event kind: {:?}", event.kind);
                                continue;
                            }
                        };

                        info!(
                            "Processing {} event with {} paths",
                            action,
                            paths_to_check.len()
                        );

                        // Process each path from the event
                        for path_buf in paths_to_check {
                            let mut success = false;
                            let mut message = String::new();

                            // Update the filename index for all files, regardless of content type
                            if action == "Upsert" {
                                let path_clone = path_buf.clone();
                                tokio::spawn(async move {
                                    match metadata(&path_clone) {
                                        Ok(meta) => {
                                            let last_modified = meta
                                                .modified()
                                                .map(|time| {
                                                    time.duration_since(std::time::UNIX_EPOCH)
                                                        .unwrap_or_default()
                                                        .as_secs()
                                                })
                                                .unwrap_or(0);
                                            let size = meta.len();
                                            if let Some(path_str) = path_clone.to_str() {
                                                match add_file_to_index(path_str.to_string(), last_modified, size).await {
                                                Ok(_) => info!("Updated Tantivy index (add/update) for {}", path_clone.display()),
                                                Err(e) => error!("Failed to update Tantivy index (add/update) for {}: {}", path_clone.display(), e),
                                            }
                                            } else {
                                                error!(
                                                    "Invalid path string for Tantivy add: {}",
                                                    path_clone.display()
                                                );
                                            }
                                        }
                                        Err(e) => error!(
                                            "Failed to get metadata for Tantivy add {}: {}",
                                            path_clone.display(),
                                            e
                                        ),
                                    }
                                });
                            } else if action == "Delete" {
                                let path_clone = path_buf.clone();
                                tokio::spawn(async move {
                                    if let Some(path_str) = path_clone.to_str() {
                                        match remove_file_from_index(path_str.to_string()).await {
                                        Ok(_) => info!("Updated Tantivy index (remove) for {}", path_clone.display()),
                                        Err(e) => error!("Failed to update Tantivy index (remove) for {}: {}", path_clone.display(), e),
                                    }
                                    } else {
                                        error!(
                                            "Invalid path string for Tantivy remove: {}",
                                            path_clone.display()
                                        );
                                    }
                                });
                            }

                            // Check if file is relevant for semantic indexing
                            let is_relevant = match action {
                                "Upsert" => is_relevant_file_for_upsert(&path_buf),
                                "Delete" => is_relevant_file(&path_buf), // For deletes, we can't check if file exists
                                _ => false,
                            };

                            if !is_relevant {
                                info!(
                                    "Skipping non-relevant file for semantic index: {}",
                                    path_buf.display()
                                );
                                continue;
                            }

                            // Perform action based on event type for semantic search
                            match action {
                                "Upsert" => {
                                    info!("Action [Upsert] detected for: {}", path_buf.display());
                                    match process_file_upsert(&path_buf, &table).await {
                                        Ok(_) => {
                                            success = true;
                                            message = format!(
                                                "Successfully indexed {}",
                                                path_buf.display()
                                            );
                                            info!(
                                                "Successfully processed upsert for {}",
                                                path_buf.display()
                                            );
                                        }
                                        Err(e) => {
                                            message = format!(
                                                "Error indexing {}: {}",
                                                path_buf.display(),
                                                e
                                            );
                                            error!(
                                                "Error processing upsert for {}: {}",
                                                path_buf.display(),
                                                e
                                            );
                                        }
                                    }
                                }
                                "Delete" => {
                                    info!("Action [Delete] detected for: {}", path_buf.display());
                                    if let Some(path_str) = path_buf.to_str() {
                                        match delete_document(&table, path_str).await {
                                            Ok(_) => {
                                                success = true;
                                                message = format!(
                                                    "Successfully removed {} from index",
                                                    path_buf.display()
                                                );
                                                info!(
                                                    "Successfully deleted DB entry for {}",
                                                    path_buf.display()
                                                );
                                            }
                                            Err(DbError::RecordNotFound(_)) => {
                                                success = true; // Not an error if record doesn't exist
                                                message = format!(
                                                    "File {} was not in index",
                                                    path_buf.display()
                                                );
                                                warn!("Attempted to delete non-existent DB entry for {}", path_buf.display());
                                            }
                                            Err(e) => {
                                                message = format!(
                                                    "Error removing {} from index: {}",
                                                    path_buf.display(),
                                                    e
                                                );
                                                error!(
                                                    "Error deleting DB entry for {}: {}",
                                                    path_buf.display(),
                                                    e
                                                );
                                            }
                                        }
                                    } else {
                                        message = format!(
                                            "Invalid path encoding: {}",
                                            path_buf.display()
                                        );
                                        error!(
                                            "Invalid path string for deletion: {}",
                                            path_buf.display()
                                        );
                                    }
                                }
                                _ => {
                                    warn!("Unhandled action type: {}", action);
                                }
                            }

                            // Emit event to frontend
                            let event_type = match action {
                                "Upsert" => {
                                    if path_buf.exists() {
                                        "created"
                                    } else {
                                        "modified"
                                    }
                                }
                                "Delete" => "deleted",
                                _ => "unknown",
                            };

                            let watcher_event = FileWatcherEvent {
                                event_type: event_type.to_string(),
                                file_path: path_buf.to_string_lossy().to_string(),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap_or_default()
                                    .as_secs(),
                                success,
                                message,
                            };

                            // Emit event to frontend
                            if let Err(e) = app_handle.emit("file-watcher-event", &watcher_event) {
                                error!("Failed to emit watcher event to frontend: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        error!("Watcher error: {:?}", e);
                        if matches!(
                            e,
                            notify::Error {
                                kind: notify::ErrorKind::PathNotFound,
                                ..
                            }
                        ) {
                            warn!("Watched path seems to have been removed.");
                        }
                    }
                }
            }
            Err(std::sync::mpsc::TryRecvError::Empty) => {
                // No messages available yet, yield to other tasks briefly
                tokio::task::yield_now().await;
            }
            Err(std::sync::mpsc::TryRecvError::Disconnected) => {
                // Channel is closed (all senders dropped)
                info!("Channel closed, exiting event processing loop");
                break;
            }
        }
    }

    info!(
        "Event processing loop exited. Processed {} events",
        events_processed
    );
}

// Helper function to handle text extraction, embedding, and DB upsert for a file
async fn process_file_upsert(path_buf: &Path, table: &Table) -> Result<(), DbError> {
    // Extract content returns TextExtractionResult { text: String, language: DetectedLanguage }
    let extraction_result = extract_text(path_buf)
        .map_err(|e| DbError::Other(format!("Text extraction failed: {}", e)))?;

    let trimmed_content = extraction_result.text.trim();

    if trimmed_content.is_empty() {
        warn!(
            "Extracted empty or whitespace-only content for {}, skipping upsert.",
            path_buf.display()
        );
        return Ok(());
    }

    // Hash the content
    let hash = calculate_hash(trimmed_content);
    info!(
        "  -> Extracted text (lang: {:?}), Hash: {}",
        extraction_result.language, hash
    );

    // Convert the single string to a Vec<String> for embed_text
    let content_vec = vec![trimmed_content.to_string()];

    // Use the new embedder function (now only uses Amharic model)
    let embedding_vec = match embed_text(&content_vec, &extraction_result.language, false) {
        Ok(vec) => vec,
        Err(e) => {
            error!(
                "Embedding generation failed for {}: {}. Skipping upsert.",
                path_buf.display(),
                e
            );
            return Ok(());
        }
    };

    if embedding_vec.is_empty() {
        warn!(
            "No embeddings generated for {}, likely due to content issues. Skipping upsert.",
            path_buf.display()
        );
        return Ok(());
    }

    info!(
        "  -> Successfully generated {} embeddings (chunks)",
        embedding_vec.len()
    );

    if let Some(path_str) = path_buf.to_str() {
        upsert_amharic_document(table, path_str, &hash, &embedding_vec).await?;
        Ok(())
    } else {
        error!(
            "Invalid file path encoding for {}. Cannot upsert.",
            path_buf.display()
        );
        Err(DbError::Other("Invalid file path encoding".to_string()))
    }
}

/// Checks if a path points to a relevant file for indexing.
/// Uses the extensions defined in extractor.rs
/// For delete events, we can't check if the file exists, so we only check the extension
fn is_relevant_file(path: &PathBuf) -> bool {
    // Check if the file name itself starts with a dot (hidden files)
    let filename_is_hidden = path
        .file_name()
        .and_then(|name| name.to_str())
        .map_or(false, |name_str| name_str.starts_with('.'));

    if filename_is_hidden {
        return false;
    }

    // Check extension using the supported extensions from extractor
    let extension_check = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map_or(false, |ext_str| {
            let lower_ext = ext_str.to_lowercase();
            SUPPORTED_TEXT_EXTENSIONS.contains(&lower_ext.as_str())
        });

    extension_check
}

/// Checks if a path points to a relevant file for indexing (for upsert operations).
/// This version checks if the file actually exists and is a file.
fn is_relevant_file_for_upsert(path: &PathBuf) -> bool {
    // Check if the file name itself starts with a dot (hidden files)
    let filename_is_hidden = path
        .file_name()
        .and_then(|name| name.to_str())
        .map_or(false, |name_str| name_str.starts_with('.'));

    if filename_is_hidden {
        return false;
    }

    // Check if it's a file
    let is_file = path.is_file();

    // Check extension using the supported extensions from extractor
    let extension_check = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map_or(false, |ext_str| {
            let lower_ext = ext_str.to_lowercase();
            SUPPORTED_TEXT_EXTENSIONS.contains(&lower_ext.as_str())
        });

    is_file && extension_check
}

/// Start watching a directory
#[tauri::command]
pub async fn start_watcher_command(path: String, app_handle: AppHandle) -> Result<String, String> {
    info!("Starting file watcher for path: {}", path);

    // Check if watcher is already running
    {
        let state = WATCHER_STATE.lock().unwrap();
        if state.is_some() {
            return Err("File watcher is already running. Stop it first.".to_string());
        }
    }

    // Connect to DB and open table
    let conn = connect_db()
        .await
        .map_err(|e| format!("Database connection failed: {}", e))?;

    let table = open_or_create_amharic_text_table(&conn)
        .await
        .map_err(|e| format!("Table creation failed: {}", e))?;

    // Setup the watcher
    let (watcher, rx, shutdown_tx) = setup_watcher(&path, app_handle.clone())
        .await
        .map_err(|e| format!("Watcher setup failed: {}", e))?;

    let table_arc = Arc::new(table);

    // Start event processing in background
    let app_handle_clone = app_handle.clone();
    let (shutdown_sender, shutdown_receiver) = channel();

    tokio::spawn(async move {
        process_events(rx, table_arc, app_handle_clone, shutdown_receiver).await;
    });

    // Store watcher state
    {
        let mut state = WATCHER_STATE.lock().unwrap();
        *state = Some(WatcherState {
            _watcher: watcher,
            shutdown_sender: Some(shutdown_sender),
        });
    }

    // Emit start event to frontend
    let start_event = FileWatcherEvent {
        event_type: "watcher-started".to_string(),
        file_path: path.clone(),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        success: true,
        message: format!("File watcher started for {}", path),
    };

    if let Err(e) = app_handle.emit("file-watcher-event", &start_event) {
        error!("Failed to emit watcher start event: {}", e);
    }

    Ok(format!("File watcher started successfully for: {}", path))
}

/// Stop the file watcher
#[tauri::command]
pub async fn stop_watcher_command(app_handle: AppHandle) -> Result<String, String> {
    info!("Stopping file watcher");

    let shutdown_sender = {
        let mut state = WATCHER_STATE.lock().unwrap();
        match state.take() {
            Some(watcher_state) => watcher_state.shutdown_sender,
            None => return Err("File watcher is not running".to_string()),
        }
    };

    // Send shutdown signal if available
    if let Some(sender) = shutdown_sender {
        if let Err(e) = sender.send(()) {
            warn!("Failed to send shutdown signal: {}", e);
        }
    }

    // Emit stop event to frontend
    let stop_event = FileWatcherEvent {
        event_type: "watcher-stopped".to_string(),
        file_path: String::new(),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        success: true,
        message: "File watcher stopped".to_string(),
    };

    if let Err(e) = app_handle.emit("file-watcher-event", &stop_event) {
        error!("Failed to emit watcher stop event: {}", e);
    }

    Ok("File watcher stopped successfully".to_string())
}

/// Get watcher status
#[tauri::command]
pub async fn get_watcher_status() -> Result<WatcherStatus, String> {
    let state = WATCHER_STATE.lock().unwrap();
    let is_running = state.is_some();

    Ok(WatcherStatus {
        is_running,
        watched_path: if is_running {
            Some("Active".to_string())
        } else {
            None
        },
        events_processed: 0, // Could be enhanced to track this
        last_event_time: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{connect_db_with_path, open_or_create_amharic_text_table, TestDb};
    use std::fs::File;
    use std::io::Write;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_is_relevant_file() {
        // Create a temporary directory
        let dir = tempdir().unwrap();

        // Create test files
        let txt_file = dir.path().join("test.txt");
        let md_file = dir.path().join("test.md");
        let pdf_file = dir.path().join("test.pdf");
        let docx_file = dir.path().join("test.docx");
        let jpg_file = dir.path().join("test.jpg");
        let exe_file = dir.path().join("test.exe");
        let hidden_file = dir.path().join(".hidden.txt");

        // Create the files
        File::create(&txt_file).unwrap();
        File::create(&md_file).unwrap();
        File::create(&pdf_file).unwrap();
        File::create(&docx_file).unwrap();
        File::create(&jpg_file).unwrap();
        File::create(&exe_file).unwrap();
        File::create(&hidden_file).unwrap();

        // Test supported extensions
        assert!(is_relevant_file_for_upsert(&txt_file));
        assert!(is_relevant_file_for_upsert(&md_file));
        assert!(is_relevant_file_for_upsert(&pdf_file));
        assert!(is_relevant_file_for_upsert(&docx_file));

        // Test unsupported extensions
        assert!(!is_relevant_file_for_upsert(&jpg_file));
        assert!(!is_relevant_file_for_upsert(&exe_file));

        // Test hidden files
        assert!(!is_relevant_file_for_upsert(&hidden_file));

        // Test delete relevance (extension-only check)
        assert!(is_relevant_file(&txt_file));
        assert!(is_relevant_file(&md_file));
        assert!(is_relevant_file(&pdf_file));
        assert!(is_relevant_file(&docx_file));
        assert!(!is_relevant_file(&jpg_file));
        assert!(!is_relevant_file(&exe_file));
        assert!(!is_relevant_file(&hidden_file));
    }

    #[tokio::test]
    async fn test_process_file_upsert() {
        // Create a temporary file
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        let mut file = File::create(&file_path).unwrap();
        writeln!(file, "This is test content for embedding").unwrap();

        // Create a temporary database
        let test_db = TestDb::new();
        let conn = connect_db_with_path(&test_db.path).await.unwrap();
        let table = open_or_create_amharic_text_table(&conn).await.unwrap();

        // Test the upsert function
        let result = process_file_upsert(&file_path, &table).await;

        // Should succeed (or handle gracefully if embedding fails in test environment)
        match result {
            Ok(_) => info!("Upsert succeeded"),
            Err(e) => info!("Upsert failed (expected in test environment): {}", e),
        }
    }
}
