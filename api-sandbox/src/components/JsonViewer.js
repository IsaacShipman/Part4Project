import React, { useState } from 'react';


const JsonViewer = ({ data }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const toggleExpand = (key) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const formatValue = (value, nestLevel = 0, path = '') => {
    if (value === null) return <span style={{ color: '#f44336' }}>null</span>;
    if (value === undefined) return <span style={{ color: '#9e9e9e' }}>undefined</span>;
    
    if (typeof value === 'boolean') {
      return <span style={{ color: '#2196f3' }}>{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span style={{ color: '#4caf50' }}>{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span style={{ color: '#ff9800' }}>"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      const currentPath = path ? `${path}` : '';
      const isExpanded = expandedKeys.has(currentPath);
      
      if (value.length === 0) {
        return <span>[]</span>;
      }
      
      return (
        <div>
          <span 
            style={{ cursor: 'pointer', color: '#9c27b0' }}
            onClick={() => toggleExpand(currentPath)}
          >
            {isExpanded ? '▼' : '▶'} Array({value.length})
          </span>
          {isExpanded && (
            <div style={{ paddingLeft: '1rem', borderLeft: '1px solid #616161', marginLeft: '0.25rem' }}>
              {value.map((item, index) => (
                <div key={index}>
                  <span style={{ color: '#9e9e9e' }}>{index}: </span>
                  {formatValue(item, nestLevel + 1, `${currentPath}.${index}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const currentPath = path ? `${path}` : '';
      const isExpanded = expandedKeys.has(currentPath);
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        return <span>{'{}'}</span>;
      }
      
      return (
        <div>
          <span 
            style={{ cursor: 'pointer', color: '#9c27b0' }}
            onClick={() => toggleExpand(currentPath)}
          >
            {isExpanded ? '▼' : '▶'} Object({keys.length})
          </span>
          {isExpanded && (
            <div style={{ paddingLeft: '1rem', borderLeft: '1px solid #616161', marginLeft: '0.25rem' }}>
              {keys.map(key => (
                <div key={key}>
                  <span style={{ color: '#03a9f4' }}>"{key}"</span>: {formatValue(value[key], nestLevel + 1, `${currentPath}.${key}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const parseAndFormatJson = (jsonString) => {
    try {
      // First try standard JSON parsing
      const parsed = JSON.parse(jsonString);
      return formatValue(parsed);
    } catch (error) {
      // If standard parsing fails, try handling common issues like single quotes
      try {

        const fixedJson = jsonString
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":'); 
        
        const parsed = JSON.parse(fixedJson);
        return (
          <>
            {formatValue(parsed)}
          </>
        );
      } catch (secondError) {
        return (
          <div style={{ color: '#f44336' }}>
            <div>Invalid JSON: {error.message}</div>
            <pre style={{ marginTop: '0.5rem', color: '#e0e0e0' }}>{jsonString}</pre>
          </div>
        );
      }
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
      {typeof data === 'string' ? parseAndFormatJson(data) : formatValue(data)}
    </div>
  );
};

export const scanForRequests = (code) => {
  const lines = code.split("\n");
  const requests = [];

  lines.forEach((line, index) => {
    const match = line.match(/requests\.(get|post|put|delete|patch)\(([^)]+)\)/);

    if (match) {
      const [, type, paramContent] = match;

      const stringMatch = paramContent.match(/['"]([^'"]+)['"]/);
      let url = "Variable used - check definition";

      if (stringMatch) {
        url = stringMatch[1];
      } else {
        const varMatch = paramContent.trim();
        url = `Variable: ${varMatch}`;
      }

      requests.push({
        line: index + 1,
        url,
        type: type.toUpperCase(),
      });
    }

    if (index > 0) {
      const prevLine = lines[index - 1];
      const fStringMatch = prevLine.match(/url\s*=\s*f['"](.*)['"]/);
      const currentRequestMatch = line.match(/requests\.(get|post|put|delete|patch)\((\w+)\)/);

      if (fStringMatch && currentRequestMatch && currentRequestMatch[2] === 'url') {
        requests.push({
          line: index + 1,
          url: fStringMatch[1],
          type: currentRequestMatch[1].toUpperCase(),
        });
      }
    }
  });

  return requests;
};

export default JsonViewer;


