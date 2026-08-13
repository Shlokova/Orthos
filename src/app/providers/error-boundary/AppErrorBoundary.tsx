import { Button } from '@shared/ui'
import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Orthos render failure', error, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <main className="error-boundary">
        <section className="error-boundary-card" role="alert">
          <h1>Orthos could not start</h1>
          <p>
            The editor encountered an unexpected rendering error. Reload the page; if the problem persists, verify that
            WebGL is enabled in the browser.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload editor
          </Button>
        </section>
      </main>
    )
  }
}
