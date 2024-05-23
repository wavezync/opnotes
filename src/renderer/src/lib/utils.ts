/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from 'clsx'

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
