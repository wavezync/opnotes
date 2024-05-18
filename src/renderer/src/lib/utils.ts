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
