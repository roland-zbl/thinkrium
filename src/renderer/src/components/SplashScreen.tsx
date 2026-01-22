import React from 'react'
import logo from '../assets/electron.svg'

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 text-white animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Logo with pulse animation */}
            <img
              src={logo}
              alt="Thinkrium Logo"
              className="w-20 h-20 animate-pulse"
            />
        </div>

        <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100/90 font-sans">
          THINKRIUM
        </h1>
      </div>
    </div>
  )
}
