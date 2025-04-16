import { atom } from "jotai";
import { FileInfo, ViewMode } from "../types/file";
import { CustomLocation } from "../types/location";
import { fetchDirectoryContents, getHomeDir, openPath, loadCustomLocations, saveCustomLocations } from "../services/test";
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

// --- Basic UI State Atoms ---
// ... (keep existing atoms like viewModeAtom, etc.)
export const viewModeAtom = atom<ViewMode>("grid");
export const fileSizeAtom = atom<number>(80);
export const gapSizeAtom = atom<number>(4);
export const selectedFileAtom = atom<FileInfo | null>(null);
export const showInspectorAtom = atom<boolean>(false);

// --- Core File Explorer State Atoms ---

// Atom to store the current directory path
export const currentPathAtom = atom<string>(""); // Current path remains central

// Atom to store the files/folders in the current directory
export const directoryFilesAtom = atom<FileInfo[]>([]);

// Atom to store loading state
export const isLoadingAtom = atom<boolean>(false);

// Atom to store potential errors
export const errorAtom = atom<string | null>(null);

// Derived atom to filter out hidden files/folders
export const visibleFilesAtom = atom((get) => {
  const allFiles = get(directoryFilesAtom);
  return allFiles.filter(file => !file.name.startsWith('.'));
});

// --- Navigation History State ---
export const pathHistoryAtom = atom<string[]>([]);
export const historyIndexAtom = atom<number>(-1);

// --- Custom Locations State ---
export const customLocationsAtom = atom<CustomLocation[]>([]);

// Atom to trigger loading custom locations on startup
export const loadLocationsOnInitAtom = atom(
  null,
  async (_get, set) => {
    try {
      const loadedLocations = await loadCustomLocations();
      set(customLocationsAtom, loadedLocations);
    } catch (error) {
      console.error("Failed to load custom locations on init:", error);
      set(customLocationsAtom, []);
    }
  }
);

// Atom to add a new custom location and save the updated list
export const addCustomLocationAtom = atom(
  null,
  async (get, set, newLocation: CustomLocation) => {
    const currentLocations = get(customLocationsAtom);
    if (currentLocations.some(loc => loc.path === newLocation.path)) {
        console.warn("Location already exists:", newLocation.path);
        return; 
    }
    const updatedLocations = [...currentLocations, newLocation];
    set(customLocationsAtom, updatedLocations);
    try {
      await saveCustomLocations(updatedLocations);
    } catch (error) {
      console.error("Failed to save custom locations after adding:", error);
      set(customLocationsAtom, currentLocations);
    }
  }
);

// --- Derived Atoms / Atoms with Logic ---

// Derived atoms for navigation button state
export const canGoBackAtom = atom((get) => get(historyIndexAtom) > 0);
export const canGoForwardAtom = atom((get) => get(historyIndexAtom) < get(pathHistoryAtom).length - 1);

// Atom to handle navigating to a new path (updates history)
export const navigateAtom = atom(
  null,
  (get, set, newPath: string) => {
    const history = get(pathHistoryAtom);
    const currentIndex = get(historyIndexAtom);

    if (history[currentIndex] === newPath) {
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newPath);

    set(pathHistoryAtom, newHistory);
    set(historyIndexAtom, newHistory.length - 1);
    set(currentPathAtom, newPath);
  }
);

// Atom to navigate back in history
export const goBackAtom = atom(
  null,
  (get, set) => {
    if (get(canGoBackAtom)) {
      const newIndex = get(historyIndexAtom) - 1;
      set(historyIndexAtom, newIndex);
      const history = get(pathHistoryAtom);
      set(currentPathAtom, history[newIndex]);
    }
  }
);

// Atom to navigate forward in history
export const goForwardAtom = atom(
  null,
  (get, set) => {
    if (get(canGoForwardAtom)) {
      const newIndex = get(historyIndexAtom) + 1;
      set(historyIndexAtom, newIndex);
      const history = get(pathHistoryAtom);
      set(currentPathAtom, history[newIndex]);
    }
  }
);

// Atom to fetch and set the initial home directory (modified)
export const loadHomeDirAtom = atom(
  null,
  async (get, set) => {
    try {
      const homeDir = await getHomeDir();
      set(navigateAtom, homeDir);
      set(errorAtom, null);
    } catch (err) {
      console.error("Failed to get home directory:", err);
      set(errorAtom, "Failed to load home directory.");
    }
  }
);

// Asynchronous atom to load directory contents (no change needed here)
export const loadDirectoryAtom = atom(
  null,
  async (get, set) => {
    const path = get(currentPathAtom);
    if (!path) return;

    set(isLoadingAtom, true);
    set(errorAtom, null);
    set(directoryFilesAtom, []);

    try {
      const files = await fetchDirectoryContents(path);
      set(directoryFilesAtom, files);
    } catch (error) {
      console.error(`Error fetching directory "${path}":`, error);
      set(errorAtom, `Failed to load directory: ${path}`);
      set(directoryFilesAtom, []);
    } finally {
      set(isLoadingAtom, false);
    }
  }
);
