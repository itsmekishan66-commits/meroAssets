import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#f8f8f8',
            color: '#111111',
            border: '1px solid #e5e5e5',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#000000', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#666666', secondary: '#ffffff' } },
        }}
      />
    </BrowserRouter>
  );
}
