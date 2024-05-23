/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createNewPatient,
  getPatientById,
  listPatients,
  updatePatientById,
  findPatientByPHN
} from './repository/patient'

import { createNewDoctor, getDoctorById, listDoctors, updateDoctorById } from './repository/doctor'

import {
  createNewFollowUp,
  createNewSurgery,
  deleteFollowUp,
  getFollowUpsBySurgeryId,
  getSurgeryById,
  listSurgeries,
  lookupSurgery,
  updateFollowUp,
  updateSurgery,
  updateSurgeryDoctorsAssistedBy,
  updateSurgeryDoctorsDoneBy
} from './repository/surgery'
import { ipcMain } from 'electron'
import { encodeError } from './utils/errors'

// Custom APIs for renderer
export const api = {
  createNewPatient,
  getPatientById,
  updatePatientById,
  listPatients,
  findPatientByPHN,

  createNewDoctor,
  getDoctorById,
  updateDoctorById,
  listDoctors,

  createNewSurgery,
  getFollowUpsBySurgeryId,
  getSurgeryById,
  lookupSurgery,
  listSurgeries,

  createNewFollowUp,
  updateFollowUp,
  deleteFollowUp,

  updateSurgery,
  updateSurgeryDoctorsAssistedBy,
  updateSurgeryDoctorsDoneBy
}

export type ApiType = typeof api

export const registerApi = () => {
  ipcMain.handle('invokeApiCall', async (_event, method: keyof ApiType, ...args: any[]) => {
    try {
      console.log('invoking api:', method, args)
      const fn = api[method] as any
      if (!fn) {
        throw new Error(`Method ${method} not found in api`)
      }

      // apply the arguments to the function
      const result = await fn(...args)
      return { result }
    } catch (error) {
      console.error('Error invoking api:', method, error)

      return { error: encodeError(error) }
    }
  })
}
