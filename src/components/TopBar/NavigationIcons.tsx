import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationIcons = () => {
  return (
    <div className="flex items-center">
      <button className="p-1 hover:bg-gray-700 rounded-md transition">
        <ChevronLeft size={16} className="text-gray-300" />
      </button>
      <button className="p-1 hover:bg-gray-700 rounded-md transition ml-1">
        <ChevronRight size={16} className="text-gray-300" />
      </button>
    </div>
  );
};

export default NavigationIcons;