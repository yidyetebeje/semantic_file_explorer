# 🧠 Semantic File Explorer

> AI-powered, privacy-first local file explorer with semantic search for documents and images — built with Rust, Tauri, LanceDB, and React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/tauri-rust%20%2B%20react-blue)
![Platform](https://img.shields.io/badge/platform-desktop-lightgrey)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## ✨ Overview

The **Semantic File Explorer** is a cross-platform desktop application that helps you find your local files based on **meaning**, not just filenames.

Powered by lightweight machine learning models, it supports:
- 🔍 **Semantic search** (documents & images)
- 📁 **Filename-based search**
- 📦 Real-time file monitoring
- 🧠 Offline vector search with LanceDB
- 🛡️ 100% local & privacy-friendly

---

## 📸 Demo

> _(Add screenshots or GIFs of your app in action here if available)_

---

## 🚀 Features

- ✅ **Semantic Search**
  - Understands natural language queries
  - Uses local embedding models (e.g., BGESmallENV15)
- 📂 **Filename Search**
  - Fast substring search with real-time filters
- 🧠 **Local Embeddings**
  - Text & image embeddings via `fastembed` and ONNX
- 🔎 **LanceDB Vector Store**
  - High-performance local similarity search
- 👀 **Real-Time File Watcher**
  - Monitors changes and reindexes automatically
- 🌱 **Jotai Atom-based State**
  - Clean, reactive frontend state management
- 🌐 **Cross-Platform**
  - Built with Tauri (Rust + React)

---

## 🛠️ Tech Stack

| Layer | Tools |
|-------|-------|
| 💡 Language | Rust, TypeScript |
| 📦 Backend | Tauri, notify, fastembed, ONNX |
| 💾 Vector DB | LanceDB |
| 🧠 ML Models | BGESmallENV15 (text), NomicEmbedVisionV15 (images) |
| 🖼️ Frontend | React, Jotai, TailwindCSS, ShadCN |

---

## 🗂️ Project Structure

```bash
semantic-file-explorer/
├── src-tauri/ # Tauri backend (Rust)
│ ├── bin/ # Standalone binary tools
│ │ └── db_repair.rs # Tool for repairing the vector database
│
│ ├── commands/ # Tauri commands exposed to frontend
│ │ ├── benchmark_commands.rs
│ │ ├── file_operations.rs
│ │ ├── fs_commands.rs
│ │ ├── indexing_commands.rs
│ │ ├── search_commands.rs # Handles filename search logic
│ │ ├── watcher_commands.rs
│ │ └── mod.rs
│
│ ├── core/ # Core business logic
│ │ ├── error.rs # Custom error handling
│ │ ├── file_system.rs # Filesystem access utilities
│ │ ├── indexer.rs # Handles indexing workflow
│ │ ├── models.rs # Data models used across modules
│ │ └── mod.rs
│
│ ├── benchmark.rs # Model benchmarking utilities
│ ├── chunker.rs # Text chunking logic
│ ├── chunking_plan.md # Design notes for chunking
│ ├── db.rs # LanceDB wrapper & utilities
│ ├── embedder.rs # Embeds text chunks using fastembed
│ ├── embedding.rs # Older or alternate embedding logic
│ ├── extractor.rs # Extracts content from files
│ ├── image_embedder.rs # Embeds image content
│ ├── lib.rs # Registers Tauri commands
│ ├── main.rs # Main entry point for Tauri app
│ ├── repair_db.rs # Database repair logic
│ ├── search.rs # Search handler (semantic)
│ └── watcher.rs # File change event listener
│
├── src/ # Frontend (React + TypeScript)
│ ├── components/ # UI components
│ ├── layout/ # Layout-related UI (Navbar, etc.)
│ ├── store/atoms.ts # Jotai atoms for global state
│ ├── services/commands.ts # Interface for calling Tauri commands
│ ├── types/ # TypeScript types for search, results, etc.


# Clone the repo
```
pnpm install
pnpm tauri dev
```
## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
