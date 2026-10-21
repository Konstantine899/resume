import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { whenReady } from './shared/lib/i18n/config/i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Lazy ru locale (issue #298): gate the FIRST render on the detected
// language's bundle — an immediately-resolved promise for en visitors, the
// ru.json chunk fetch for ru visitors (it starts during module evaluation
// and overlaps it). Rendering earlier would flash en copy to ru visitors;
// a failed chunk fetch resolves via fallbackLng to en — never to raw keys.
void whenReady.then(() =>
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
