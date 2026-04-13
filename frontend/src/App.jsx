import { useState } from "react";
import Upload from "./pages/Upload";
import Dashboard from "./pages/dashboard";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [processed, setProcessed] = useState(false);

  const handleProcessed = () => {
    setProcessed(true);
    setPage("dashboard");
  };

  return (
    <div style={{ fontFamily: "'Geist', sans-serif", background: "#222831", minHeight: "100vh", color: "#EEEEEE" }}>
      {page === "upload" ? (
        <Upload onProcessed={handleProcessed} />
      ) : (
        <Dashboard onUploadMore={() => { setPage("upload"); setProcessed(false); }} />
      )}
    </div>
  );
}