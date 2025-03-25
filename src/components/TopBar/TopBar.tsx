import { useState, FC, useRef, useEffect } from 'react';

import NavigationIcons from './NavigationIcons';
import ViewModeButtons from './ViewModeButtons';
import RightSectionIcons from './RightSectionIcons';
import DropdownMenu from './DropdownMenu';

interface TopBarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSizeChange: (size: number) => void;
  onGapChange: (gap: number) => void;
  onInspectorToggle: () => void;
  isInspectorActive: boolean;
}

const TopBar: FC<TopBarProps> = ({
  viewMode,
  onViewModeChange,
  onSizeChange,
  onGapChange,
  onInspectorToggle,
  isInspectorActive,
}) => {
  const [url, setUrl] = useState<string>('C:\\Users\\User');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<number>(80);
  const [gapSize, setGapSize] = useState<number>(4);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFileSize(newSize);
    onSizeChange(newSize);
  };

  const handleGapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGap = parseInt(e.target.value);
    setGapSize(newGap);
    onGapChange(newGap);
  };

  return (
    <div className="bg-gray-800/50 p-1 flex items-center rounded-b-lg shadow-lg fixed top-0 left-0 right-0 z-10">
      <NavigationIcons />
      <div className="flex items-center flex-grow mx-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-gray-700 text-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          style={{ width: '140px' }}
        />
      </div>
      <ViewModeButtons viewMode={viewMode} onViewModeChange={onViewModeChange} />
      <div className="h-4 border-l border-gray-600 mx-2" />
      <RightSectionIcons
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        isInspectorActive={isInspectorActive}
        onInspectorToggle={onInspectorToggle}
      />
      <DropdownMenu
        showDropdown={showDropdown}
        dropdownRef={dropdownRef}
        fileSize={fileSize}
        gapSize={gapSize}
        handleSizeChange={handleSizeChange}
        handleGapChange={handleGapChange}
      />
    </div>
  );
};

export default TopBar;