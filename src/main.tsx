import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// The quiz does not download the control page, its router or dashboard providers.
const Entry = lazy(() => /^\/quiz\/?$/.test(window.location.pathname)
  ? import("./pages/SosDynamicQuiz")
  : import("./App"));

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div role="status" style={{minHeight:"100dvh",padding:28,background:"#0B1B3F",color:"#fff",fontSize:20}}>Preparando seu vídeo…</div>}>
    <Entry />
  </Suspense>
);
