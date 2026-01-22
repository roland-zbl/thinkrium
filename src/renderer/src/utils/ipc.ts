import { IPCResult } from '@shared/types/ipc'
import { useToastStore } from '@/stores/toast.store'
import { AppError } from './errors'

export interface InvokeOptions {
  /**
   * If true, suppresses the error toast. The error is still logged to console and thrown.
   * Defaults to false.
   */
  silent?: boolean
  /**
   * @deprecated Use `silent` instead. If false, silent is true.
   */
  showErrorToast?: boolean
}

/**
 * Helper to invoke IPC methods that return IPCResult<T>.
 * Automatically handles errors by showing a toast (unless silent) and throwing an AppError.
 *
 * @param promise The promise returned by window.api.* method
 * @param options Configuration options
 * @returns The data from the IPC result
 * @throws AppError if success is false or promise rejects
 */
export async function invokeIPC<T>(
  promise: Promise<IPCResult<T>>,
  options: InvokeOptions = {}
): Promise<T> {
  // Default silent is false.
  // If showErrorToast is strictly false, silent is true.
  const silent = options.silent ?? (options.showErrorToast === false)

  try {
    const result = await promise

    if (!result.success) {
      const errorData = result.error
      const message = errorData?.message || 'Unknown IPC Error'
      const code = errorData?.code || 'IPC_ERROR'

      // Create AppError using the backend message as userMessage for now
      const appError = new AppError(message, code, message, errorData)

      console.error(`[IPC Error] ${code}:`, message)

      if (!silent) {
        useToastStore.getState().addToast({
          type: 'error',
          title: '操作失敗', // Operation failed
          description: appError.userMessage
        })
      }

      throw appError
    }

    // We can cast here because if success is true, data should be present (or T is void/undefined)
    return result.data as T
  } catch (error) {
    // If it's already an AppError (re-thrown), just bubble it up
    if (error instanceof AppError) {
      throw error
    }

    // Wrap unexpected errors (e.g. network failure, promise rejection not caught by IPC wrapper)
    const message = error instanceof Error ? error.message : String(error)
    const wrappedError = new AppError(
      message,
      'UNEXPECTED_ERROR',
      `發生未預期錯誤: ${message}`,
      error
    )

    console.error('[IPC Unexpected]', error)

    if (!silent) {
      useToastStore.getState().addToast({
        type: 'error',
        title: '操作失敗',
        description: wrappedError.userMessage
      })
    }

    throw wrappedError
  }
}
