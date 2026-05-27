import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Ocorreu um erro inesperado. Por favor recarrega a página.</p>
          <button onClick={() => window.location.reload()}>Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
