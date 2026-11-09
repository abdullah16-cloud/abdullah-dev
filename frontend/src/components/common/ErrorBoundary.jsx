import React, { Component } from 'react';
import ErrorState from './ErrorState';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Something went wrong rendering this section"
          message="An unexpected error occurred while displaying motorcycles."
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
