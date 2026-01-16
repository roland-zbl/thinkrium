import { is } from '@electron-toolkit/utils'
import { IPCResult } from '@shared/types/ipc'

/**
 * Wraps an IPC handler function to standardize the response format.
 * Catches errors and formats them into an IPCResult object.
 *
 * @param handler The async function to execute
 * @returns A promise resolving to an IPCResult
 */
export async function handleIPC<T>(handler: () => Promise<T> | T): Promise<IPCResult<T>> {
  try {
    const data = await handler()
    return {
      success: true,
      data
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    // Log error to console in main process for debugging
    console.error('IPC Handler Error:', err)

    return {
      success: false,
      error: {
        message: err.message,
        // Optional: Map specific error types to codes here if needed
        code: 'INTERNAL_ERROR',
        stack: is.dev ? err.stack : undefined
      }
    }
  }
}
