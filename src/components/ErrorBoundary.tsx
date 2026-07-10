import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; errorId: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: '' }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true, errorId: `ERR-${Date.now().toString(36).toUpperCase()}` }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack?.split('\n')[1]?.trim())
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-1">The app encountered an unexpected error.</p>
          <p className="text-xs font-mono text-gray-400 mb-6">{this.state.errorId}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm"
          >
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
