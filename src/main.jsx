import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './compiled.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VAULT CRITICAL] React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#051811',
          color: '#F0FDF4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#072418',
            border: '3px solid #10B981',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ color: '#FBBF24', fontSize: '24px', marginBottom: '12px', fontWeight: 'bold' }}>
              🛡️ TERMINAL RECOVERY ENGAGED
            </h1>
            <p style={{ color: '#A7F3D0', fontSize: '13px', marginBottom: '20px' }}>
              An interface anomaly was intercepted by the Syndicate security protocol.
            </p>
            <div style={{
              backgroundColor: '#020B06',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#FF6B8B',
              marginBottom: '20px',
              overflowX: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error?.message || 'Unknown runtime anomaly'}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              style={{
                backgroundColor: '#10B981',
                color: '#02140D',
                fontWeight: 'bold',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'uppercase'
              }}
            >
              Reset Session & Reload HUD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

