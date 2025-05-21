import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WebsocketProvider } from './contexts/WebsocketContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebsocketProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-150">
            <Dashboard />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </WebsocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
