import FileIcon from './FileIcon';

interface FileItemProps {
  name: string;
  type: string;
  size: number; 
}

const FileItem = ({ name, type, size }: FileItemProps) => {
  return (
    <div className="relative cursor-pointer group">
      <div className="flex flex-col items-center justify-center p-1 rounded-md group-hover:bg-white/10 transition-all">
        <div className="relative">
          <FileIcon type={type} size={size} /> {/* Use size prop for icon size */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
        </div>
        {/* File Name */}
        <p
          className="text-sm text-gray-300 group-hover:text-white group-hover:font-bold text-center truncate mt-1"
          style={{ fontSize: `${size * 0.2}px` }} // Dynamic font size
        >
          {name}
        </p>
      </div>
    </div>
  );
};

export default FileItem;