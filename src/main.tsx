import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Google Maps Platform Quota Defense & Error Handlers
window.addEventListener('gm_authFailure', () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
});

const origError = console.error;
console.error = (...args: any[]) => {
  if (args.some(a => typeof a === 'string' && (a.includes('OverQuotaMapError') || a.includes('billing')))) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
  origError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
