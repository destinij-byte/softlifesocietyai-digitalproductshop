import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches render/lifecycle errors anywhere in the route tree so a bug in
// one page shows a branded fallback instead of a blank white screen.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in route:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container page vault-status">
          <p>Something didn't load right.</p>
          <button className="btn btn-gold" onClick={() => window.location.reload()}>
            Refresh the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
