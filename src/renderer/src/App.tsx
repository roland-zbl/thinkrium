import React from 'react'
import { AppShell } from './components/layout/AppShell'
import { SetupDialog } from './components/SetupDialog'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalLoadingIndicator } from './modules/feed/components/GlobalLoadingIndicator'
import { useFeedStore } from './modules/feed/store/feed.store'
import { Toaster } from '@/components/ui/Toast'

const App: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    useFeedStore.getState().initSchedulerListeners()
  }, [])

  React.useEffect(() => {
    const checkSetup = async () => {
      // Skip setup check in E2E testing mode
      if (window.api.isE2ETesting) {
        setIsSetupComplete(true)
        return
      }
      const rootDir = await window.api.settings.get('notes.rootDir')
      setIsSetupComplete(!!rootDir)
    }
    checkSetup()
  }, [])

  if (isSetupComplete === null) {
    // 顯示 Loading 指示器而非空白
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-zinc-400">正在載入...</p>
        </div>
      </div>
    )
  }

  if (isSetupComplete === false) {
    return (
      <ErrorBoundary>
        <SetupDialog onComplete={() => setIsSetupComplete(true)} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <AppShell />
      <GlobalLoadingIndicator />
      <Toaster />
    </ErrorBoundary>
  )
}

export default App
