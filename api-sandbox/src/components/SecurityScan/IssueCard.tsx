import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import { useState } from "react";

interface IssueCardProps {
  issueData: any;
  onIssueClick: () => void;
  isSelected: boolean;
}

function IssueCard({ issueData, onIssueClick, isSelected }: IssueCardProps) {
  const [open, setOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#dc2626"; // red
      case "high":
        return "#f97316"; // orange
      case "moderate":
        return "#3b82f6"; // blue
      default:
        return "#94a3b8";
    }
  };

  const severityColor = getSeverityColor(issueData.severity);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: isSelected
          ? hexToRgba(severityColor, 0.3)
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${severityColor}`,
        borderRadius: 2,
        cursor: "pointer",
        boxShadow: isSelected
          ? `0 0 0 3px ${hexToRgba(severityColor, 0.5)}`
          : "none",
        transition: "box-shadow 0.3s ease, background-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      }}
      onClick={onIssueClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Severity:{" "}
            <span style={{ color: severityColor }}>
              {issueData.severity.toUpperCase()}
            </span>
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#94a3b8",
              backgroundColor: "rgba(148, 163, 184, 0.1)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontFamily: "monospace",
            }}
          >
            Line {issueData.line}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {issueData.issue}
        </Typography>

        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking button
            setOpen(!open);
          }}
          sx={{ textTransform: "none" }}
        >
          {open ? "Hide More" : "Show More"}
        </Button>

        <Collapse in={open}>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {issueData.recommendation}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
