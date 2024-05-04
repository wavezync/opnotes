import {
  createNewPatient,
  getPatientById,
  listPatients,
  lookupPatient,
  updatePatientById,
  findPatientByPHN
} from './repository/patient'

import { createNewDoctor, getDoctorById, listDoctors, updateDoctorById } from './repository/doctor'

import {
  createNewFollowUp,
  createNewSurgery,
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
  lookupPatient,
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
