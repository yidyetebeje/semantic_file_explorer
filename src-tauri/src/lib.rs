// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use commands::fs_commands::{
    get_documents_dir, get_downloads_dir, get_home_dir, get_movies_dir, list_directory_command,
    open_path_command, save_custom_locations, load_custom_locations,
    get_hostname_command
};
mod commands;
mod core;
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_target(false)
        .compact()
        .init();
    tracing::info!("Application starting up...");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_directory_command,
            get_home_dir,
            open_path_command,
            get_downloads_dir,
            get_movies_dir,
            get_documents_dir,
            load_custom_locations,
            save_custom_locations,
            get_hostname_command

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
