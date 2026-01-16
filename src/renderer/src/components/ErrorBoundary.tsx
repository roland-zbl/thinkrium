import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { tokens } from '@/styles/tokens'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center"
          style={{ backgroundColor: tokens.colors.bgBase, color: tokens.colors.textPrimary }}
        >
          <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 max-w-md opacity-80">
            The application encountered an unexpected error.
            Please try reloading the application.
          </p>

          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Application
          </button>

          {this.state.error && (
            <div className="mt-8 w-full max-w-2xl overflow-auto rounded-md bg-zinc-100 p-4 text-left text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
