import { useEffect } from "react";
import { useSetAtom } from 'jotai';
import "./App.css";
import FileExplorer from "./components/FileExplorerBody/FileExplorer";
import MainLayout from "./components/layout/MainLayout";
import { loadHomeDirAtom, loadLocationsOnInitAtom } from "./store/atoms";

function App() {
  const loadHomeDir = useSetAtom(loadHomeDirAtom);
  const loadLocations = useSetAtom(loadLocationsOnInitAtom);

  useEffect(() => {
    loadHomeDir();
    loadLocations();
    console.log("App mounted, initiating home directory and location load.");
  }, [loadHomeDir, loadLocations]);

  return (
    <main className="container mx-auto min-h-screen min-w-full bg-gray-900  bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      <MainLayout>
        <FileExplorer />
      </MainLayout>
    </main>
  );
}

export default App;
