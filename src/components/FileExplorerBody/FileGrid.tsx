import { FileItem as FileItemType, ViewMode } from '../../types/file';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import FileList from './FileList';

interface FileGridProps {
  files: FileItemType[];
  viewMode: ViewMode;
  onFileSelect?: (file: FileItemType) => void;
}

const FileGrid = ({ files, viewMode, onFileSelect }: FileGridProps) => {
  if (viewMode === 'list') {
    return <FileList files={files} onFileSelect={onFileSelect} />;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 p-6 rounded-lg ">
        {files.map((file, index) =>
          file.type === "folder" ? (
            <div key={`${file.name}-${index}`} onClick={() => onFileSelect?.(file)}>
              <FolderItem
                name={file.name}
              />
            </div>
          ) : (
            <div key={`${file.name}-${index}`} onClick={() => onFileSelect?.(file)}>
              <FileItem
                name={file.name}
                type={file.type}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FileGrid;