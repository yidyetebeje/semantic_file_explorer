import { Button } from "@/components/ui/button";
import {
  Globe,
  HardDrive,
  Laptop,
  Film,
  FileText,
  Download,
  Plus,
  Settings,
  Clock,
} from "lucide-react";
import LibraryDropdown from "./LibraryDropdown";
import SidebarSection from "./SidebarSection";
import NavButton from "./NavButton";


const Sidebar = () => {
  return (
    <div className="w-60 border-r border-gray-800 h-screen bg-gray-900 flex flex-col">
      {/* Library Selector */}
      <div className="p-4 border-b border-gray-800">
        <LibraryDropdown />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <SidebarSection title="Overview">
          <NavButton icon={Globe} label="Network" />
          <NavButton icon={HardDrive} label="Macintosh HD" />
          <NavButton icon={Laptop} label="Ruth's MacBook" />
        </SidebarSection>

        <SidebarSection title="Locations">
          <NavButton icon={Film} label="Movies" />
          <NavButton icon={FileText} label="Documents" />
          <NavButton icon={Download} label="Downloads" />
        </SidebarSection>

        {/*Location Button */}
        <Button variant="ghost" className="w-full justify-start text-gray-500 hover:bg-gray-800 cursor-pointer hover:text-gray-300">
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <NavButton icon={Settings} label="Settings" />
        <NavButton icon={Clock} label="Recent" />
      </div>
    </div>
  );
};

export default Sidebar;
