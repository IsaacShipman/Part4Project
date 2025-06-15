import React, { useState } from "react";
import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import MainEditor from "../components/CodeEditor/MainEditor";
import { ChevronRight, Memory } from "@mui/icons-material";
import { containerStyles, listStyles } from "../styles/containerStyles";
import IssueCard from "../components/SecurityScan/IssueCard";

const panelStyles = {
  // Updated header style to match CodeEditor exactly
  header: {
    background:
      "linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.3)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    // Remove the explicit border radius to allow it to follow the parent container
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
  const [defaultCode, setDefaultCode] = useState(
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
  // const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState([
    {
      issue: "Hardcoded API key exposes sensitive information.",
      line: 2,
      severity: "critical",
      recommendation:
        "Store API keys in environment variables and load them securely at runtime.",
    },
    {
      issue: "API requests use an unencrypted HTTP URL.",
      line: 4,
      severity: "high",
      recommendation:
        "Use HTTPS to encrypt communication and protect data in transit.",
    },
    {
      issue:
        "No input validation on user-supplied data before making the API call.",
      line: 8,
      severity: "moderate",
      recommendation:
        "Validate and sanitize all inputs to prevent injection and unexpected behavior.",
    },
    {
      issue: "No error handling for failed HTTP requests.",
      line: 9,
      severity: "moderate",
      recommendation:
        "Check the response status and wrap requests in try-except blocks to handle errors gracefully.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null); // Track selected line

  // Handler for when an issue card is clicked
  const handleIssueClick = (lineNumber: number) => {
    setSelectedLine(lineNumber);
  };

  const handleExecuteCode = async () => {
    setLoading(true);
    // try {
    //   const response = await fetch("http://localhost:8000/security-scan", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ code: defaultCode }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.text();
    //     console.error("Error response:", errorData);
    //     setScanResult(`Error: ${errorData}`);
    //     return;
    //   }

    //   const data = await response.json();
    //   console.log("Received data:", data);

    //   // Directly stringify results for display
    //   setScanResult(JSON.stringify(data, null, 2));
    // } catch (error) {
    //   console.error("Error:", error);
    //   if (error instanceof Error) {
    //     setScanResult("Error: " + error.message);
    //   } else {
    //     setScanResult("An unknown error occurred.");
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Box
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
          code={defaultCode}
          setCode={setDefaultCode}
          onExecuteCode={handleExecuteCode}
          standalone={true}
          highlightedLine={selectedLine}
        />
      </Box>

      <Paper elevation={0} sx={{ ...containerStyles, width: "35%" }}>
        {/* Header */}
        <Box sx={panelStyles.header}>
          <Box sx={panelStyles.headerContent}>
            <Memory sx={panelStyles.icon} />
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
          {Array.isArray(scanResult) &&
            scanResult.map((issue, index) => (
              <IssueCard
                key={index}
                issueData={issue}
                onIssueClick={() => handleIssueClick(issue.line)}
                isSelected={selectedLine === issue.line}
              />
            ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default SecurityScanView;
