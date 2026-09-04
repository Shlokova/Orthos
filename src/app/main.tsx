import '@app/styles/index.css'
import App from '@app/App'
import { AppErrorBoundary } from '@app/providers/error-boundary/AppErrorBoundary'
import { createEditorRuntime, EditorProvider } from '@features/editor'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Orthos root element was not found')

const editorController = createEditorRuntime()

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <AppErrorBoundary>
      <EditorProvider controller={editorController}>
        <App />
        <Analytics />
      </EditorProvider>
    </AppErrorBoundary>
  </StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    editorController.dispose()
    root.unmount()
  })
}
