import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  public render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use the provided fallback or the default error UI
      return fallback || <DefaultErrorFallback error={error} errorInfo={errorInfo} />;
    }

    return children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme.colors.errorBg || '#fdecea',
      color: theme.colors.error || '#d32f2f',
      borderRadius: '4px',
      margin: '10px 0',
      border: `1px solid ${theme.colors.error || '#f5c6cb'}`,
    }}>
      <h3 style={{ marginTop: 0 }}>Something went wrong</h3>
      <p>{error?.toString()}</p>
      {process.env.NODE_ENV === 'development' && errorInfo && (
        <details style={{ whiteSpace: 'pre-wrap' }}>
          <summary>Error details</summary>
          <div style={{ 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.03)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: theme.colors.text,
          }}>
            {errorInfo.componentStack}
          </div>
        </details>
      )}
    </div>
  );
};

export default ErrorBoundary;

// Custom hook to use error boundaries in functional components
export function useErrorHandler(error?: Error): void {
  React.useEffect(() => {
    if (error) {
      // Simulate the error being caught by an error boundary
      throw error;
    }
  }, [error]);
}

// Higher-order component for error boundaries
export function withErrorBoundary<T>(
  WrappedComponent: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props as any} />
    </ErrorBoundary>
  );
}
