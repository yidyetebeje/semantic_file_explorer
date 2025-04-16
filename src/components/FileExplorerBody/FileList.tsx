import { FileInfo } from '../../types/file';
import FileIcon from './FileIcon';
import { formatDate, formatSize } from '../../lib/utils';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useState, useEffect } from 'react';

interface FileListProps {
  files: FileInfo[];
  onFileSelect?: (file: FileInfo) => void;
  onFileDoubleClick?: (file: FileInfo) => void;
  fileSize: number;
  gapSize: number;
}

const ListItemIcon: React.FC<{ file: FileInfo; size: number }> = ({ file, size }) => {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.thumbnail_path) {
      try {
        setAssetUrl(convertFileSrc(file.thumbnail_path));
      } catch (error) {
        console.error("Error converting thumbnail path:", file.thumbnail_path, error);
        setAssetUrl(null);
      }
    } else {
      setAssetUrl(null);
    }
  }, [file.thumbnail_path]);

  return (
    <div 
      className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded mr-2" 
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {assetUrl ? (
        <img src={assetUrl} alt={file.name} className="object-cover w-full h-full" loading="lazy" />
      ) : (
        <FileIcon 
          type={file.file_type} 
          isDirectory={file.is_directory} 
          size={size * 0.8}
        />
      )}
    </div>
  );
};

const FileList = ({ files, onFileSelect, onFileDoubleClick, fileSize, gapSize }: FileListProps) => {
  const basePadding = 4;
  const baseFontSize = 14;

  const iconSize = Math.max(20, fileSize * 0.25);
  const dynamicFontSize = Math.max(12, baseFontSize * (fileSize / 80));
  const dynamicPaddingY = Math.max(2, basePadding * (fileSize / 80));

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800/50 text-gray-400 font-medium sticky top-[40px] z-[5]"
        style={{ fontSize: `${dynamicFontSize}px` }}
      >
        <div className="col-span-6 flex items-center gap-2">Name</div>
        <div className="col-span-3 text-right pr-4">Date Modified</div>
        <div className="col-span-3 text-right pr-4">Size</div>
      </div>

      {/* File List */}
      <div className="overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.path}
            className="grid grid-cols-12 gap-4 px-4 hover:bg-white/5 cursor-pointer transition-colors items-center"
            style={{
              fontSize: `${dynamicFontSize}px`,
              paddingTop: `${dynamicPaddingY}px`,
              paddingBottom: `${dynamicPaddingY}px`,
              marginBottom: `${gapSize}px`,
            }}
            onClick={() => onFileSelect?.(file)}
            onDoubleClick={() => {
              onFileDoubleClick?.(file);
            }}
          >
            <div className="col-span-6 flex items-center gap-0 overflow-hidden pr-2">
              <ListItemIcon file={file} size={iconSize} />
              <span className="text-gray-200 truncate" title={file.name}>{file.name}</span>
            </div>
            <div className="col-span-3 text-gray-400 text-right pr-4">
              {file.modified ? formatDate(new Date(file.modified * 1000).toISOString()) : '--'}
            </div>
            <div className="col-span-3 text-gray-400 text-right pr-4">
              {file.is_directory ? '--' : formatSize(file.size)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;