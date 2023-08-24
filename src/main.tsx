import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Button, ThemeProvider, createTheme } from '@mui/material';
import { red } from '@mui/material/colors';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { saveActivePrompt } from './common/saving/localstorage.ts';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: red[500],
    },
  },
});

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  const message =
    error instanceof Error
      ? error.message
      : JSON.stringify(error, undefined, 2);
  function resetActivePrompt() {
    saveActivePrompt('');
  }
  return (
    <div className="text-red-600">
      <h1>Oh No! Something went wrong!</h1>
      <main>
        <pre className="w-auto ">{message}</pre>
      </main>

      <div>
        <Button variant="outlined" onClick={resetActivePrompt}>
          Reset Active Prompt?
        </Button>
      </div>
      <div>
        <Button variant="outlined" onClick={resetErrorBoundary}>
          Retry?
        </Button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ErrorBoundary fallbackRender={fallbackRender}>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
