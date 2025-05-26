import { FileItem as FileItemType } from '../../types/file';
import FileIcon from './FileIcon';
import { formatDate } from '../../lib/utils';

interface FileListProps {
  files: FileItemType[];
  onFileSelect?: (file: FileItemType) => void;
  fileSize: number; 
  gapSize: number;  
}

const FileList = ({ files, onFileSelect, fileSize, gapSize }: FileListProps) => {
  
  const iconSize = fileSize * 0.3; 
  const fontSize = fileSize * 0.12; 
  const padding = fileSize * 0.2; 

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800/50 text-gray-400 font-medium"
        style={{
          fontSize: `${fontSize}px`, 
          padding: `${padding}px`,   
        }}
      >
        <div className="col-span-6 flex items-center gap-2">Name</div>
        <div className="col-span-3">Date Modified</div>
        <div className="col-span-3">Size</div>
      </div>

      {/* File List */}
      <div>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
            style={{
              fontSize: `${fontSize}px`, 
              padding: `${padding}px`,   
              marginBottom: `${gapSize}px`, 
            }}
            onClick={() => onFileSelect?.(file)}
          >
            <div className="col-span-6 flex items-center gap-2">
              <FileIcon type={file.type} size={iconSize} /> {/* Dynamic icon size */}
              <span className="text-gray-300 truncate">{file.name}</span>
            </div>
            <div className="col-span-3 text-gray-400">
              {formatDate(file.dateCreated)}
            </div>
            <div className="col-span-3 text-gray-400">
              {file.size || '--'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;