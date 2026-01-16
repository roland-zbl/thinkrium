export interface IPCResult<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    stack?: string
  }
}
