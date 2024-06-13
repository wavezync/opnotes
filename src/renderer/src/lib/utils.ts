/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'

import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function unwrapResult<T>(promise: Promise<{ result: T; error: any }>) {
  const { result, error } = await promise
  if (error) {
    const err = new Error(error.message)
    Object.assign(err, error.extra)
    throw err
  }

  return result
}

export const trim = (str: string, len = 20) => (str.length > len ? str.slice(0, len) + '...' : str)

export const formatDate = (date?: Date) => dayjs(date).format('DD/MM/YYYY')

export const formatDateTime = (date?: Date) => dayjs(date).format('DD/MM/YYYY HH:mm')

export const formatTime = (date?: Date) => dayjs(date).format('HH:mm')

export const isEmptyString = (str?: string | null) => str && str.trim().length === 0

export const isEmptyHtml = (html?: string | null) => {
  if (!html) {
    return true
  }

  const tempEl = document.createElement('div')
  tempEl.innerHTML = html
  return !tempEl.textContent?.trim()
}
