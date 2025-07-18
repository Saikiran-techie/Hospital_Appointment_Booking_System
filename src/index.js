import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from './context/LoadingContext';
import LoadingOverlay from './components/Common/LoadingOverlay';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/custom.css";
import { BrowserRouter } from 'react-router-dom';  // ✅ Import this

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* ✅ Add this */}
      <AuthProvider>
        <LoadingProvider>
          <App />
          <LoadingOverlay />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>  {/* ✅ Wrap everything inside */}
  </React.StrictMode>
);

reportWebVitals();
