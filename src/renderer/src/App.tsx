import React from 'react'
import { AppShell } from './components/layout/AppShell'
import { SetupDialog } from './components/SetupDialog'

const App: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const checkSetup = async () => {
      const rootDir = await window.api.settings.get('notes.rootDir')
      setIsSetupComplete(!!rootDir)
    }
    checkSetup()
  }, [])

  if (isSetupComplete === null) {
    return null // Loading state
  }

  if (isSetupComplete === false) {
    return <SetupDialog onComplete={() => setIsSetupComplete(true)} />
  }

  return <AppShell />
}

export default App
