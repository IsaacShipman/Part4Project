import React, { useState } from "react";
import { Box, Paper, Typography, IconButton, styled, alpha } from "@mui/material";
import MainEditor from "../components/CodeEditor/MainEditor";
import { ChevronRight, LocationSearching, GppMaybe } from "@mui/icons-material";
import { containerStyles, listStyles } from "../styles/containerStyles";
import IssueCard from "../components/SecurityScan/IssueCard";

const MainContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.background.default} 0%, 
    ${alpha(theme.palette.background.paper, 0.8)} 50%,
    ${theme.palette.background.default} 100%)`,
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
}));

const panelStyles = {
  header: {
    background:
      "linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  headerTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  icon: {
    color: "rgba(59, 130, 246, 0.8)",
    fontSize: 18,
  },
  closeButton: {
    color: "#94a3b8",
    p: 0.5,
    "&:hover": {
      color: "#e2e8f0",
      backgroundColor: "rgba(148, 163, 184, 0.1)",
    },
  },
  listContainer: {
    flex: 1,
    overflow: "auto",
    ...listStyles,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#64748b",
    p: 3,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "2.5rem",
    mb: 2,
    opacity: 0.6,
  },
  emptyText: {
    fontWeight: 500,
    fontSize: "0.9rem",
    mb: 1,
  },
  emptySubtext: {
    fontSize: "0.8rem",
    opacity: 0.7,
  },
};

function SecurityScanView() {
  const [editorCode, setEditorCode] = useState(
    `import requests
API_KEY = "12345-SECRET-API-KEY"
BASE_URL = "https://example.com/data"

def get_data():
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.get(BASE_URL, headers=headers)
    return response.json()

    print(get_data())
    `
  );
  const [scanResult, setScanResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null); // Track selected line

  // Handler for when an issue card is clicked
  const handleIssueClick = (lineNumber: number) => {
    setSelectedLine(lineNumber);
  };

  const handleExecuteCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/security-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editorCode }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        setScanResult([
          {
            issue: `Error response: ${errorData}`,
            line: 0,
            severity: "critical",
            recommendation: "Please run Security Scan again.",
          },
        ]);
        return;
      }

      const data = await response.json();
      console.log("Received data:", data);
      setScanResult(data);
    } catch (error) {
      console.error("Error:", error);
      setScanResult([
        {
          issue: `Error response: ${error}`,
          line: 0,
          severity: "critical",
          recommendation: "Please run Security Scan again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 36px)",
        marginTop: 8,
        gap: 2,
      }}
    >
      <Box sx={{ width: "65%" }}>
        <MainEditor
          code={editorCode}
          setCode={setEditorCode}
          onExecuteCode={handleExecuteCode}
          standalone={true}
          highlightedLine={selectedLine}
        />
      </Box>

      <Paper elevation={0} sx={{ ...containerStyles, width: "35%" }}>
        {/* Header */}
        <Box sx={panelStyles.header}>
          <Box sx={panelStyles.headerContent}>
            <GppMaybe sx={panelStyles.icon} />
            <Typography variant="subtitle2" sx={panelStyles.headerTitle}>
              SECURITY SCAN RESULTS
            </Typography>
          </Box>
          <IconButton sx={panelStyles.closeButton}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Content Area */}
        <Box sx={{ ...panelStyles.listContainer, p: 2, overflowY: "auto" }}>
          {loading ? (
            <Box sx={panelStyles.emptyState}>
              <Typography variant="body2" sx={panelStyles.emptyText}>
                Loading...
              </Typography>
            </Box>
          ) : Array.isArray(scanResult) && scanResult.length > 0 ? (
            scanResult.map((issue, index) => (
              <IssueCard
                key={index}
                issueData={issue}
                onIssueClick={() => handleIssueClick(issue.line)}
                isSelected={selectedLine === issue.line}
              />
            ))
          ) : (
            <Box sx={panelStyles.emptyState}>
              <LocationSearching sx={panelStyles.emptyIcon} />
              <Typography variant="body2" sx={panelStyles.emptyText}>
                No scan results yet.
              </Typography>
              <Typography variant="body2" sx={panelStyles.emptySubtext}>
                Run a security scan to view detected issues.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </MainContainer>
  );
}

export default SecurityScanView;
