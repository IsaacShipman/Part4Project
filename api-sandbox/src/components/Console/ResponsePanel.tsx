import React, { useState } from 'react';
import Split from 'react-split';
import { useTheme } from '@mui/material';
import { ApiCall } from '../../types/api';
import RequestViewer from './RequestViewer';
import Terminal from './Terminal';

interface ResponsePanelProps {
  response: string | null;
  loading: boolean;
  getRequests: { line: number; url: string; type: string }[];
  apiResponses: { line: number; url: string; response: string }[];
  selectedRequestIndex: number | null;
  selectedApiCall: ApiCall | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ 
  response, 
  loading, 
  selectedApiCall
}) => {
  const theme = useTheme();
  const [terminalMaximized, setTerminalMaximized] = useState<boolean>(false);
  const [terminalMinimized, setTerminalMinimized] = useState<boolean>(false);
  const [splitSizes, setSplitSizes] = useState([30, 70]);

  // Toggle maximized terminal view
  const toggleMaximized = () => {
    if (terminalMaximized) {
      setSplitSizes([30, 70]);
    } else {
      setSplitSizes([0, 100]);
    }
    setTerminalMaximized(!terminalMaximized);
    setTerminalMinimized(false);
  };

  // Toggle minimized terminal view
  const toggleMinimized = () => {
    if (terminalMinimized) {
      setSplitSizes([30, 70]);
    } else {
      setSplitSizes([100, 0]);
    }
    setTerminalMinimized(!terminalMinimized);
    setTerminalMaximized(false);
  };

  // Clear the terminal (mock function)
  const clearTerminal = () => {
    console.log("Terminal cleared");
  };

  return (
    <Split
      sizes={splitSizes}
      minSize={0}
      expandToMin={false}
      gutterSize={5}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
      style={{ 
        display: 'flex', 
        flexGrow: 1, 
        height: '100%',
        backgroundColor: theme.custom.colors.background.primary,
      }}
      onDragEnd={(sizes) => {
        setSplitSizes(sizes);
        setTerminalMaximized(sizes[0] === 0);
        setTerminalMinimized(sizes[1] === 0);
      }}
    >
      {/* Left Panel - Request Viewer */}
      <div style={{ 
        visibility: splitSizes[0] === 0 ? 'hidden' : 'visible', 
        width: '100%', 
        height: '100%',
        backgroundColor: theme.custom.colors.background.primary,
      }}>
        <RequestViewer 
          loading={loading} 
          selectedApiCall={selectedApiCall} 
        />
      </div>

      {/* Right Panel - Terminal */}
      <div style={{ 
        visibility: splitSizes[1] === 0 ? 'hidden' : 'visible', 
        width: '100%', 
        height: '100%',
        backgroundColor: theme.custom.colors.background.primary,
      }}>
        <Terminal 
          response={response}
          loading={loading}
          terminalMaximized={terminalMaximized}
          terminalMinimized={terminalMinimized}
          toggleMaximized={toggleMaximized}
          toggleMinimized={toggleMinimized}
          clearTerminal={clearTerminal}
        />
      </div>
    </Split>
  );
};

export default ResponsePanel;