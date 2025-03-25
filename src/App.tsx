

import "./App.css";
import FileExplorer from "./components/FileExplorerBody/FileExplorer";
import TopBar from "./components/TopBar/TopBar";

function App() {


  return (
    <main className="container mx-auto p-4 min-h-screen min-w-full bg-gray-900  bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
    
      
      <FileExplorer />
    </main>

  );
}

export default App;
