

import "./App.css";
import FileExplorer from "./components/FileExplorerBody/FileExplorer";

import MainLayout from "./components/layout/MainLayout";


function App() {


  return (
    <main className="container mx-auto min-h-screen min-w-full bg-gray-900  bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      <MainLayout>
        <FileExplorer />
      </MainLayout>

    </main>

  );
}

export default App;
