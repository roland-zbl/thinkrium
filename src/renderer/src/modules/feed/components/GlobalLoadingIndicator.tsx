import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useFeedStore } from '../store/feed.store'

export const GlobalLoadingIndicator: React.FC = () => {
    const { isFetching } = useFeedStore()

    // Safety timeout? Or just rely on store state.
    // Let's rely on store state but add local effect debug

    if (!isFetching) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-full shadow-lg text-sm transition-all animate-in fade-in slide-in-from-bottom-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating feeds...</span>
        </div>
    )
}
