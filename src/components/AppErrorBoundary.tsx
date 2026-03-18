import React from 'react'

interface AppErrorBoundaryState {
  hasError: boolean
  message: string
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = {
      hasError: false,
      message: '',
    }
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown runtime error'
    return {
      hasError: true,
      message,
    }
  }

  componentDidCatch(error: unknown) {
    console.error('Application crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4">Application Error</h1>
            <p className="text-gray-300 mb-3">The app could not start correctly.</p>
            <p className="text-red-300 text-sm break-words">{this.state.message}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
