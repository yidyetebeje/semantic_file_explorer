import { Button } from "@/components/ui/button";

const NavButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-gray-300 hover:bg-gray-800 cursor-pointer">
    <Icon className="mr-2 h-4 w-4" />
    {label}
  </Button>
);

export default NavButton;
