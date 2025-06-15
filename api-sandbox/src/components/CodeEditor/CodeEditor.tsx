import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Box, Typography, Paper, styled, IconButton } from "@mui/material";
import { Code } from "lucide-react";
import {
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onExecuteCode?: () => void;
  onSaveCode?: () => void; // New prop for saving code
  isSaved?: boolean; // New prop to indicate if code is saved
  highlightedLine?: number | null;
}

// Glassy container with backdrop blur effect
const GlassyPaper = styled(Paper)(({ theme }) => ({
  background:
    "linear-gradient(135deg, rgba(15, 20, 25, 0.9) 0%, rgba(26, 35, 50, 0.95) 100%)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  // Remove the margin and adjust height
  margin: 0,
  display: "flex",
  flexDirection: "column",
  height: "100%", // Full height without subtraction
}));

// Header with gradient
const EditorHeader = styled(Box)(({ theme }) => ({
  background:
    "linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)",
  borderBottom: "1px solid rgba(59, 130, 246, 0.3)",
  padding: "8px 16px",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)",
  },
}));

// Editor container
const EditorContainer = styled(Box)({
  flexGrow: 1,
  height: "100%",
  overflow: "hidden",
});

export default function PythonEditor({
  code,
  setCode,
  onExecuteCode,
  onSaveCode,
  isSaved = true,
  highlightedLine = null,
}: CodeEditorProps) {
  const [editorReady, setEditorReady] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [currentDecorations, setCurrentDecorations] = useState<string[]>([]);
  const [monacoInstance, setMonacoInstance] = useState<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Store editor and monaco in ref for external access

    
    // Define custom theme
    monaco.editor.defineTheme("cyberpunk-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        // Keywords (def, class, if, else, etc.)
        { token: "keyword", foreground: "#ff6b9d", fontStyle: "bold" },
        { token: "keyword.control", foreground: "#ff6b9d", fontStyle: "bold" },

        // Strings
        { token: "string", foreground: "#4ecdc4" },
        { token: "string.quoted", foreground: "#4ecdc4" },

        // Comments
        { token: "comment", foreground: "#6c757d", fontStyle: "italic" },

        // Numbers
        { token: "number", foreground: "#ffd93d" },
        { token: "number.float", foreground: "#ffd93d" },

        // Functions and methods
        { token: "identifier.function", foreground: "#a8e6cf" },
        { token: "support.function", foreground: "#a8e6cf" },

        // Classes
        { token: "support.class", foreground: "#ffb3ba" },
        { token: "entity.name.class", foreground: "#ffb3ba" },

        // Variables
        { token: "variable", foreground: "#e8e8e8" },
        { token: "identifier", foreground: "#e8e8e8" },

        // Operators
        { token: "operator", foreground: "#ff9f43" },
        { token: "delimiter", foreground: "#ff9f43" },

        // Built-in functions
        { token: "support.function.builtin", foreground: "#74b9ff" },

        // Decorators
        { token: "meta.decorator", foreground: "#fd79a8" },

        // Types
        { token: "support.type", foreground: "#fdcb6e" },

        // Regular expressions
        { token: "regexp", foreground: "#00b894" },

        // Constants
        { token: "constant", foreground: "#fab1a0" },
        { token: "constant.language", foreground: "#fab1a0" },

        // Imports
        { token: "keyword.import", foreground: "#6c5ce7", fontStyle: "bold" },

        // Exception keywords
        {
          token: "keyword.exception",
          foreground: "#e17055",
          fontStyle: "bold",
        },
      ],
      colors: {
        "editor.background": "#0f1419",
        "editor.foreground": "#e8e8e8",
        "editor.lineHighlightBackground": "#1a1f2e40",
        "editor.selectionBackground": "#264f78",
        "editor.selectionHighlightBackground": "#264f7840",
        "editor.findMatchBackground": "#515c6a",
        "editor.findMatchHighlightBackground": "#515c6a40",
        "editor.hoverHighlightBackground": "#264f7840",
        "editor.wordHighlightBackground": "#575757",
        "editor.wordHighlightStrongBackground": "#004972",
        "editorCursor.foreground": "#ff6b9d",
        "editorWhitespace.foreground": "#3b4261",
        "editorIndentGuide.background": "#3b4261",
        "editorIndentGuide.activeBackground": "#6c757d",
        "editorLineNumber.foreground": "#6c757d",
        "editorLineNumber.activeForeground": "#ff6b9d",
        "editorGutter.background": "#0f1419",
        "editorBracketMatch.background": "#0064001a",
        "editorBracketMatch.border": "#4ecdc4",
        "scrollbarSlider.background": "#3b426180",
        "scrollbarSlider.hoverBackground": "#3b426140",
        "scrollbarSlider.activeBackground": "#3b4261",
        "editorSuggestWidget.background": "#1a1f2e",
        "editorSuggestWidget.border": "#3b4261",
        "editorSuggestWidget.foreground": "#e8e8e8",
        "editorSuggestWidget.selectedBackground": "#264f78",
        "editorHoverWidget.background": "#1a1f2e",
        "editorHoverWidget.border": "#3b4261",
      },
    });

    // Enhanced Python language configuration
    monaco.languages.setLanguageConfiguration("python", {
      comments: {
        lineComment: "#",
        blockComment: ['"""', '"""'],
      },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
      ],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: '"""', close: '"""' },
        { open: "'''", close: "'''" },
      ],
      surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      indentationRules: {
        increaseIndentPattern:
          /^\s*(class\s+\w+.*:|def\s+\w+.*:|if\s+.*:|elif\s+.*:|else\s*:|for\s+.*:|while\s+.*:|try\s*:|except\s*.*:|finally\s*:|with\s+.*:)\s*$/,
        decreaseIndentPattern: /^\s*(break|continue|pass|return|raise)\s*$/,
      },
    });

    // Set the custom theme
    monaco.editor.setTheme("cyberpunk-theme");

    setEditorInstance(editor);
    setMonacoInstance(monaco);
    setEditorReady(true);
  };

  useEffect(() => {
    if (editorInstance && monacoInstance) {
      // Clear previous decorations
      if (currentDecorations.length > 0) {
        editorInstance.deltaDecorations(currentDecorations, []);
      }

      if (highlightedLine !== null) {
        // Create new decoration for the highlighted line using monaco.Range
        const decorations = [
          {
            range: new monacoInstance.Range(
              highlightedLine,
              1,
              highlightedLine,
              1
            ),
            options: {
              isWholeLine: true,
              className: "highlighted-error-line",
              glyphMarginClassName: "highlighted-error-glyph",
              overviewRuler: {
                color: "#ff4757",
                position: 4, // OverviewRulerLane.Right
              },
              minimap: {
                color: "#ff4757",
                position: 2, // MinimapPosition.Inline
              },
            },
          },
        ];

        // Apply new decorations
        const newDecorationIds = editorInstance.deltaDecorations(
          [],
          decorations
        );
        setCurrentDecorations(newDecorationIds);

        // Scroll to the highlighted line
        editorInstance.revealLineInCenter(highlightedLine);
      } else {
        setCurrentDecorations([]);
      }

      // Add/update CSS for error line styling
      const style = document.createElement("style");
      style.textContent = `
        .highlighted-error-line {
          background-color: rgba(255, 71, 87, 0.2) !important;
          border-left: 4px solid #ff4757 !important;
          animation: pulse-highlight 0.6s ease-in-out;
        }
        .highlighted-error-glyph {
          background-color: #ff4757 !important;
          width: 4px !important;
        }
        @keyframes pulse-highlight {
          0% { background-color: rgba(255, 71, 87, 0.4); }
          50% { background-color: rgba(255, 71, 87, 0.6); }
          100% { background-color: rgba(255, 71, 87, 0.2); }
        }
      `;

      // Remove existing error styles and add new ones
      const existingStyle = document.getElementById("monaco-highlight-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
      style.id = "monaco-highlight-styles";
      document.head.appendChild(style);
    }
  }, [editorInstance, monacoInstance, highlightedLine]);

  return (
    <GlassyPaper elevation={0}>
      <EditorHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Code size={18} color="rgba(59, 130, 246, 0.8)" />
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            PYTHON EDITOR
          </Typography>

          {/* Save Button */}
          <IconButton
            onClick={onSaveCode}
            disabled={!onSaveCode || !editorReady || isSaved}
            sx={{
              ml: 2,
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 25px rgba(16, 185, 129, 0.5)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.02)",
                color: "#444",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            title="Save Code"
          >
            <SaveIcon fontSize="small" />
          </IconButton>

          {/* Run Code Button */}
          <IconButton
            onClick={onExecuteCode}
            disabled={!onExecuteCode || !editorReady}
            sx={{
              ml: 1,
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4A90E2 0%, #6BA3F0 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(74, 144, 226, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #4A90E2 0%, #6BA3F0 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 25px rgba(74, 144, 226, 0.5)",
              },
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.02)",
                color: "#444",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            title="Run Code"
          >
            <PlayArrowIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              ml: "auto",
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: editorReady ? "#4ecdc4" : "#6c757d",
              boxShadow: editorReady
                ? "0 0 8px rgba(78, 205, 196, 0.6)"
                : "none",
              transition: "all 0.3s ease",
            }}
          />
        </Box>
      </EditorHeader>

      <EditorContainer>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="python"
          value={code}
          onChange={(val) => setCode(val || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily:
              '"JetBrains Mono", "Fira Code", "SF Mono", "Monaco", "Inconsolata", monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineHeight: 22,
            letterSpacing: 0.5,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            cursorBlinking: "smooth",
            renderWhitespace: "selection",
            renderLineHighlight: "gutter",
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              highlightActiveIndentation: true,
              bracketPairs: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showUsers: true,
              showIssues: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            parameterHints: { enabled: true },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            accessibilitySupport: "auto",
            autoIndent: "full",
            formatOnPaste: true,
            formatOnType: true,
            insertSpaces: true,
            tabSize: 4,
            detectIndentation: true,
            trimAutoWhitespace: true,
            wordWrap: "on",
            wordWrapColumn: 100,
            wrappingIndent: "indent",
            mouseWheelZoom: true,
            multiCursorModifier: "ctrlCmd",
            selectionHighlight: true,
            codeLens: true,
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "mouseover",
            matchBrackets: "always",
            glyphMargin: false,
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              arrowSize: 11,
              useShadows: true,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14,
              verticalSliderSize: 14,
              horizontalSliderSize: 14,
            },
          }}
        />
      </EditorContainer>
    </GlassyPaper>
  );
}
