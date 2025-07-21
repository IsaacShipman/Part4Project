import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Box, Typography, Paper, styled, IconButton, useTheme } from "@mui/material";
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
  background: theme.custom.colors.background.gradient,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${theme.custom.colors.border.primary}`,
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: theme.palette.mode === 'dark' 
    ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    : "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  // Remove the margin and adjust height
  margin: 0,
  display: "flex",
  flexDirection: "column",
  height: "100%", // Full height without subtraction
}));

// Header with gradient
const EditorHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
  padding: "8px 16px",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
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
  const theme = useTheme();

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Store editor and monaco in ref for external access

    // Define custom dark theme with navy background
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [], // Keep all default rules
      colors: {
        "editor.background": "#1a2332", // Navy blue background
        "editorGutter.background": "#1a2332", // Navy blue gutter
        "sideBar.background": "#1a2332", // Navy blue sidebar
        "activityBar.background": "#1a2332", // Navy blue activity bar
        "statusBar.background": "#1a2332", // Navy blue status bar
        "titleBar.activeBackground": "#1a2332", // Navy blue title bar
        "menu.background": "#1a2332", // Navy blue menu
        "dropdown.background": "#1a2332", // Navy blue dropdown
        "input.background": "#1a2332", // Navy blue input
        "editorWidget.background": "#1a2332", // Navy blue widgets
        "editorSuggestWidget.background": "#1a2332", // Navy blue suggestions
        "editorHoverWidget.background": "#1a2332", // Navy blue hover
        "debugToolBar.background": "#1a2332", // Navy blue debug toolbar
        "panel.background": "#1a2332", // Navy blue panel
        "terminal.background": "#1a2332", // Navy blue terminal
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

    // Set the appropriate theme based on current mode
    monaco.editor.setTheme(theme.palette.mode === 'dark' ? "custom-dark" : "vs");

    setEditorInstance(editor);
    setMonacoInstance(monaco);
    setEditorReady(true);
  };

  // Update theme when it changes
  useEffect(() => {
    if (monacoInstance) {
      monacoInstance.editor.setTheme(theme.palette.mode === 'dark' ? "custom-dark" : "vs");
    }
  }, [monacoInstance, theme.palette.mode]);

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
                color: theme.palette.error.main,
                position: 4, // OverviewRulerLane.Right
              },
              minimap: {
                color: theme.palette.error.main,
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
    }
  }, [editorInstance, monacoInstance, highlightedLine, theme.palette.error.main]);

  return (
    <GlassyPaper elevation={0}>
      <EditorHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Code size={18} color={theme.custom.colors.primary} />
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{
              color: theme.custom.colors.text.primary,
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
              background: `linear-gradient(135deg, ${theme.custom.colors.accent} 0%, ${theme.custom.colors.accent}80 100%)`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              boxShadow: `0 4px 20px ${theme.custom.colors.accent}40`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.custom.colors.accent} 0%, ${theme.custom.colors.accent}80 100%)`,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 25px ${theme.custom.colors.accent}50`,
              },
              "&:disabled": {
                background: `${theme.custom.colors.background.tertiary}02`,
                color: theme.custom.colors.text.muted,
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
              background: `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.primary}80 100%)`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF",
              boxShadow: `0 4px 20px ${theme.custom.colors.primary}40`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.primary}80 100%)`,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 25px ${theme.custom.colors.primary}50`,
              },
              "&:disabled": {
                background: `${theme.custom.colors.background.tertiary}02`,
                color: theme.custom.colors.text.muted,
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
              bgcolor: editorReady ? theme.custom.colors.accent : theme.custom.colors.text.muted,
              boxShadow: editorReady
                ? `0 0 8px ${theme.custom.colors.accent}60`
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
            fontFamily: theme.custom.terminal.fontFamily,
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
