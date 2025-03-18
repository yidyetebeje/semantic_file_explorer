import { FC } from 'react';

interface FileIconProps {
  type: string;
  size?: number;
  className?: string;
}

const FileIcon: FC<FileIconProps> = ({ type, size = 64, className = "" }) => { 
  const getIcon = () => {
    const iconPath = `/images/${getIconName(type)}.svg`;
    return <img src={iconPath} alt={type} width={size} height={size} className={className} />;
  };

  const getIconName = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'folder':
        return 'folder-house';
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'folder-picture';
      case 'video':
      case 'mp4':
      case 'mov':
        return 'folder-video';
      case 'audio':
      case 'mp3':
      case 'wav':
        return 'folder-music';
      default:
        return 'folder-document';
    }
  };

  return getIcon();
};

export default FileIcon;