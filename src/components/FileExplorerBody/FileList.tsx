import { FileItem as FileItemType } from '../../types/file';
import FileIcon from './FileIcon';
import { formatDate } from '../../lib/utils';

interface FileListProps {
  files: FileItemType[];
  onFileSelect?: (file: FileItemType) => void;
}

const FileList = ({ files, onFileSelect }: FileListProps) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800/50 text-gray-400 text-sm font-medium">
        <div className="col-span-6 flex items-center gap-2">Name</div>
        <div className="col-span-3">Date Modified</div>
        <div className="col-span-3">Size</div>
      </div>

      {/* File List */}
      <div className="divide-y divide-gray-700">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-white/5 cursor-pointer transition-colors"
            onClick={() => onFileSelect?.(file)}
          >
            <div className="col-span-6 flex items-center gap-2">
              <FileIcon type={file.type} size={24} />
              <span className="text-gray-300 truncate">{file.name}</span>
            </div>
            <div className="col-span-3 text-gray-400 text-sm">
              {formatDate(file.dateCreated)}
            </div>
            <div className="col-span-3 text-gray-400 text-sm">
              {file.size || '--'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;