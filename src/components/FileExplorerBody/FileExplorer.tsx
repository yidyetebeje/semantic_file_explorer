import { useState } from 'react';
import { FileItem, ViewMode } from '../../types/file';
import FileGrid from './FileGrid';
import TopBar from '../TopBar/TopBar'; 

const FileExplorer = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [fileSize, setFileSize] = useState<number>(80); 
  const [gapSize, setGapSize] = useState<number>(4); 
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null); 
  const [showInspector, setShowInspector] = useState<boolean>(false); 

  const files: FileItem[] = [
    {
      name: "Documents",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },
    {
      name: "Documents",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },
    {
      name: "Documents",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },
    {
      name: "Documents",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },
    {
      name: "Document",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },
  ];

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file); 
    console.log('Selected:', file);
  };

  const handleInspectorToggle = () => {
    setShowInspector(!showInspector); 
  };

  return (
    <div className="min-h-screen w-full">
      
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/10 backdrop-blur-md">
        <TopBar 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          onSizeChange={setFileSize} 
          onGapChange={setGapSize} 
          onInspectorToggle={handleInspectorToggle}
          isInspectorActive={showInspector} 
        />
        
        <div className="w-full h-px bg-gray-500/20 backdrop-blur-sm"></div>
      </div>

      {/* Inspector Section (Right Side) */}
      {showInspector && selectedFile && (
        <div className="fixed top-24 right-4 z-10">
          <div className="bg-gray-800/70 rounded-lg p-4 mt-2 shadow-lg w-64">
            <p className="text-gray-300 font-bold text-center">{selectedFile.name}</p>

            <div className="w-full h-px bg-gray-600 my-2"></div>

            {/* File Details */}
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Type: {selectedFile.type}</p>
              <p className="text-gray-400 text-sm">Size: {selectedFile.size}</p>
              <p className="text-gray-400 text-sm">
                Created: {new Date(selectedFile.dateCreated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (Offset by Top Bar) */}
      <div className="pt-16"> 
        <FileGrid
          files={files}
          viewMode={viewMode}
          fileSize={fileSize}  
          gapSize={gapSize}    
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default FileExplorer;