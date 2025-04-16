import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  LayoutGrid, 
  List, 
  RefreshCw, 
  Share2, 
  Maximize 
} from "lucide-react";
import { useAtomValue, useSetAtom } from 'jotai';
import {
  canGoBackAtom,
  canGoForwardAtom,
  goBackAtom,
  goForwardAtom
} from '../../store/atoms'; // Adjust path if needed

const Navbar = () => {
  // Get navigation state and setters
  const canGoBack = useAtomValue(canGoBackAtom);
  const canGoForward = useAtomValue(canGoForwardAtom);
  const goBack = useSetAtom(goBackAtom);
  const goForward = useSetAtom(goForwardAtom);

  return (
    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={`hover:bg-gray-800 ${!canGoBack ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={goBack}
          disabled={!canGoBack}
          title="Go Back"
        >
          <ArrowLeft className={`h-4 w-4 ${!canGoBack ? 'text-gray-600' : 'text-gray-400'}`} />
        </Button>
        {/* Forward Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className={`hover:bg-gray-800 ${!canGoForward ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={goForward}
          disabled={!canGoForward}
          title="Go Forward"
        >
          <ArrowRight className={`h-4 w-4 ${!canGoForward ? 'text-gray-600' : 'text-gray-400'}`} />
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium text-gray-300">Desktop</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search"
            className="pl-8 bg-gray-800/50 border-gray-700 text-gray-300 focus:border-gray-600"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <LayoutGrid className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <List className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <RefreshCw className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <Share2 className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-800">
          <Maximize className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;