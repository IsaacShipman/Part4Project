import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import { useState } from "react";

function IssueCard({ issueData }: { issueData: any }) {
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
        return "#94a3b8"; // slate gray (fallback)
    }
  };

  const severityColor = getSeverityColor(issueData.severity);

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: `1px solid ${severityColor}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Severity:{" "}
          <span style={{ color: severityColor }}>
            {issueData.severity.toUpperCase()}
          </span>
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {issueData.issue}
        </Typography>

        <Button
          size="small"
          onClick={() => setOpen(!open)}
          sx={{ textTransform: "none" }}
        >
          {open ? "Hide Fix" : "Show More"}
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
