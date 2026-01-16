import { IPCResult } from '@shared/types/ipc'
import { useToastStore } from '@/stores/toast.store'

interface InvokeOptions {
  showErrorToast?: boolean
}

/**
 * Helper to invoke IPC methods that return IPCResult<T>.
 * Automatically handles errors by showing a toast and throwing an error.
 *
 * @param promise The promise returned by window.api.* method
 * @param options Configuration options
 * @returns The data from the IPC result
 * @throws Error if success is false
 */
export async function invokeIPC<T>(
  promise: Promise<IPCResult<T>>,
  options: InvokeOptions = { showErrorToast: true }
): Promise<T> {
  try {
    const result = await promise

    if (!result.success) {
      const error = result.error
      const message = error?.message || 'Unknown IPC Error'

      if (options.showErrorToast) {
        useToastStore.getState().addToast({
          type: 'error',
          title: '操作失敗', // Operation failed
          description: message
        })
      }

      throw new Error(message)
    }

    // We can cast here because if success is true, data should be present (or T is void/undefined)
    return result.data as T
  } catch (error) {
    // If the promise itself rejected (network error, etc that wasn't caught by wrapper, unlikely but possible)
    // or if we threw above.
    throw error
  }
}
