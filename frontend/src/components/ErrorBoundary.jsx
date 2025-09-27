import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', minHeight: '100vh' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Something went wrong</h2>
            <div style={{ marginBottom: '16px' }}>
              <div>An error occurred while rendering this component.</div>
              <div>Please check the browser console for more details.</div>
            </div>
            <button 
              onClick={() => this.setState({ hasError: false })}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;