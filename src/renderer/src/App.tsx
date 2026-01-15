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
    return <SetupDialog onComplete={() => setIsSetupComplete(true)} />
  }

  return <AppShell />
}

export default App
