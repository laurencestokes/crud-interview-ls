import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';

const isProd = import.meta.env.PROD;

async function enableMocking() {
  const { worker } = await import('./mocks/browser');

  return (
    worker as {
      start: ({
        serviceWorker,
      }: {
        serviceWorker: { url: string };
      }) => Promise<void>;
    }
  ).start({
    serviceWorker: {
      url: isProd
        ? '/crud-interview-ls/mockServiceWorker.js'
        : '/mockServiceWorker.js',
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
});
