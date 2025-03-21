import { FileItem as FileItemType, ViewMode } from '../../types/file';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import FileList from './FileList';

interface FileGridProps {
  files: FileItemType[];
  viewMode: ViewMode;
  fileSize: number;  
  gapSize: number;   
  onFileSelect?: (file: FileItemType) => void;
}

const FileGrid = ({ files, viewMode, fileSize, gapSize, onFileSelect }: FileGridProps) => {
  if (viewMode === 'list') {
    return <FileList files={files} onFileSelect={onFileSelect} fileSize={fileSize} gapSize={gapSize} />;
  }

  return (
    <div
      className="w-full h-full p-4"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gapSize}px`, 
        alignContent: 'flex-start', 
        overflow: 'hidden', 
      }}
    >
      {files.map((file, index) => {
        const itemSize = fileSize * 2; 
        const itemHeight = fileSize * 2; 

        return file.type === "folder" ? (
          <div
            key={`${file.name}-${index}`}
            onClick={() => onFileSelect?.(file)}
            style={{
              width: `${itemSize}px`, 
              height: `${itemHeight}px`, 
            }}
            className="flex justify-center items-center"
          >
            <FolderItem
              name={file.name}
              size={itemSize * 0.5} 
            />
          </div>
        ) : (
          <div
            key={`${file.name}-${index}`}
            onClick={() => onFileSelect?.(file)}
            style={{
              width: `${itemSize}px`, 
              height: `${itemHeight}px`, 
            }}
            className="flex justify-center items-center"
          >
            <FileItem
              name={file.name}
              type={file.type}
              size={itemSize * 0.5} 
            />
          </div>
        );
      })}
    </div>
  );
};

export default FileGrid;