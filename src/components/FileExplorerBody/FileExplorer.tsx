import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { FileInfo, ViewMode } from "../../types/file";
import FileGrid from "./FileGrid";
import TopBar from "../TopBar/TopBar";
import { Grid, List } from "lucide-react";
import { openPath } from "../../services/test";
import {
  viewModeAtom,
  fileSizeAtom,
  gapSizeAtom,
  selectedFileAtom,
  showInspectorAtom,
  currentPathAtom,
  directoryFilesAtom,
  isLoadingAtom,
  errorAtom,
  loadDirectoryAtom,
  visibleFilesAtom,
  navigateAtom
} from '../../store/atoms';

const FileExplorer = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [fileSize, setFileSize] = useAtom(fileSizeAtom);
  const [gapSize, setGapSize] = useAtom(gapSizeAtom);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [showInspector, setShowInspector] = useAtom(showInspectorAtom);

  const currentPath = useAtomValue(currentPathAtom);
  const files = useAtomValue(visibleFilesAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const error = useAtomValue(errorAtom);

  const loadDirectory = useSetAtom(loadDirectoryAtom);
  const navigate = useSetAtom(navigateAtom);

  useEffect(() => {
    console.log(`Path changed to: ${currentPath}, triggering directory load.`);
    setSelectedFile(null);
    setShowInspector(false);
    loadDirectory();
  }, [currentPath, loadDirectory, setSelectedFile, setShowInspector]);

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
    console.log("Selected:", file);
  };

  const handleFileDoubleClick = async (file: FileInfo) => {
    console.log("Double-clicked:", file);
    if (file.is_directory) {
      navigate(file.path);
    } else {
      try {
        await openPath(file.path);
      } catch (err) {
        console.error("Failed to open file:", err);
      }
    }
  };

  const handleInspectorToggle = () => {
    setShowInspector(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950/30 to-gray-900 w-full">
      <div className="flex justify-end mb-4 gap-2 pt-2 pr-2">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
        >
          <List size={20} />
        </button>
      </div>

      <div className="fixed top-0 left-0 right-0 z-10 ">
     

        <div className="w-full h-px bg-gray-500/20 backdrop-blur-sm"></div>
      </div>

      {showInspector && selectedFile && (
        <div className="fixed top-16 right-4 z-20 pt-4">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg w-64 border border-gray-700/50">
            <p className="text-gray-200 font-bold text-center break-words">
              {selectedFile.name}
            </p>

            <div className="w-full h-px bg-gray-600 my-2"></div>

            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Type: {selectedFile.file_type}</p>
              {selectedFile.size !== null && (
                 <p className="text-gray-400 text-sm">Size: {selectedFile.size.toLocaleString()} bytes</p>
              )}
              <p className="text-gray-400 text-sm">
                Modified:{" "}
                 {selectedFile.modified ? new Date(selectedFile.modified * 1000).toLocaleDateString() : 'N/A'}
               </p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 px-4 pb-4">
        {isLoading && <p className="text-center text-gray-400">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!isLoading && !error && (
          <FileGrid
            files={files}
            viewMode={viewMode}
            fileSize={fileSize}
            gapSize={gapSize}
            onFileSelect={handleFileSelect}
            onFileDoubleClick={handleFileDoubleClick}
          />
        )}
         {!isLoading && !error && files.length === 0 && (
           <p className="text-center text-gray-500">Directory is empty or not accessible.</p>
         )}
      </div>
    </div>
  );
};

export default FileExplorer;
