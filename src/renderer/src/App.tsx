import React from 'react'
import { AppShell } from './components/layout/AppShell'
import { SetupDialog } from './components/SetupDialog'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SplashScreen } from './components/SplashScreen'
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
    return <SplashScreen />
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
