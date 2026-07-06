import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './components/ui';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WishlistProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </WishlistProvider>
    </AuthProvider>
  </StrictMode>
);
