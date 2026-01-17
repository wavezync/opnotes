export interface PrintDialogArgs {
  title?: string
  data?: object
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'

export interface UpdateStatusPayload {
  status: UpdateStatus
  updateInfo?: {
    version: string
    releaseNotes?: string | null
    releaseName?: string | null
    releaseDate?: string
  }
  progress?: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  }
  error?: string
}
