import { useState } from 'react';
import { FileItem, ViewMode } from '../../types/file';
import FileGrid from './FileGrid';
import { List, Grid } from 'lucide-react';

const FileExplorer = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
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
      name: "Documents",
      type: "folder",
      dateCreated: new Date().toISOString(),
      size: "--"
    },

        
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950/30 to-gray-900 w-full">
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <List size={20} />
        </button>
      </div>
      
      <FileGrid
        files={files}
        viewMode={viewMode}
        onFileSelect={(file) => console.log('Selected:', file)}
      />
    </div>
  );
};

export default FileExplorer;