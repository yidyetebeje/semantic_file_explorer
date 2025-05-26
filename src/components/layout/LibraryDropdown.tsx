import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { FolderOpen } from "lucide-react";

const LibraryDropdown = () => {  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-gray-300 cursor-pointer">
          <FolderOpen className="mr-2 h-4 w-4" />
          Ruth's Library
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-gray-900 text-gray-300">
        <DropdownMenuItem>Library 1</DropdownMenuItem>
        <DropdownMenuItem>Library 2</DropdownMenuItem>
        <DropdownMenuItem>Library 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LibraryDropdown;  