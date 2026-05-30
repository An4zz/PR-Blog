import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/** Renders any render-time crash as readable on-screen text (helps debugging
 *  on devices without a dev console) instead of a blank white page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 16,
            font: '13px/1.5 monospace',
            color: '#b91c1c',
            whiteSpace: 'pre-wrap',
          }}
        >
          {'The app hit an error:\n\n' +
            this.state.error.message +
            '\n\n' +
            (this.state.error.stack ?? '')}
        </div>
      )
    }
    return this.props.children
  }
}
