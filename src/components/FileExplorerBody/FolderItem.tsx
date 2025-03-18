import FileIcon from './FileIcon';

interface FolderItemProps {
  name: string;
}

const FolderItem = ({ name }: FolderItemProps) => {
  return (
    <div className="relative cursor-pointer group">
      <div className="mb-8 flex flex-col items-center justify-center p-3  rounded-md group-hover:bg-white/10 transition-all">
        <div className="relative">
          <FileIcon type="folder" size={64} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
        </div>
      </div>
      
      <div className="absolute -bottom-8 left-0 right-0 px-2 py-1 bg-transparent group-hover:bg-blue-400 rounded-md">
        <p className="text-sm text-gray-300 group-hover:text-white group-hover:font-bold text-center truncate">
          {name}
        </p>
      </div>
    </div>
  );
};

export default FolderItem;