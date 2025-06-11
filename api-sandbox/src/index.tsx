import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { FileManagerProvider } from './contexts/FileManagerContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <FileManagerProvider>
      <App />
    </FileManagerProvider>
  </React.StrictMode>
);

