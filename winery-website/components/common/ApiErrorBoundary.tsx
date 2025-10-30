import React, { Component, ReactNode } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  isNetworkError: boolean;
  errorMessage?: string;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError = error.message.includes('fetch') || 
                          error.message.includes('network') ||
                          error.message.includes('Failed to fetch');
    
    return { 
      hasError: true, 
      isNetworkError,
      errorMessage: error.message 
    };
  }

  componentDidCatch(error: Error) {
    console.error('API Error Boundary caught an error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, isNetworkError: false, errorMessage: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            {this.state.isNetworkError ? (
              <WifiOff className="h-12 w-12 text-gray-400" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {this.state.isNetworkError ? 'Connection Problem' : 'Something went wrong'}
          </h3>
          
          <p className="text-gray-600 mb-4 max-w-sm">
            {this.state.isNetworkError 
              ? 'Please check your internet connection and try again.'
              : 'We encountered an issue loading this content. Please try again.'
            }
          </p>
          
          <button
            onClick={this.handleRetry}
            className="bg-wine-red hover:bg-wine-red-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
            <details className="mt-4 text-left w-full">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.errorMessage}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;