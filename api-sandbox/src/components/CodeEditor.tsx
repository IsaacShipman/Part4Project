import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void; 
}

export default function PythonEditor( { code, setCode }: CodeEditorProps) {
  return (
  
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="python"
        value={code}
        onChange={(val) => setCode(val || "")}
        theme="vs-dark"
      />

  );
}
