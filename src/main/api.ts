/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createNewPatient,
  getPatientById,
  listPatients,
  updatePatientById,
  findPatientByPHN,
  deletePatientById
} from './repository/patient'

import {
  createNewDoctor,
  deleteDoctorById,
  getDoctorById,
  listDoctors,
  updateDoctorById
} from './repository/doctor'

import {
  createNewFollowUp,
  createNewSurgery,
  deleteFollowUp,
  deleteSurgeryById,
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
import log from 'electron-log'
import { getAllSettings, updateSetting, updateSettings } from './repository/app-settings'
import {
  createSurgeryTemplate,
  getSurgeryTemplateById,
  updateSurgeryTemplateById,
  deleteSurgeryTemplateById,
  listSurgeryTemplates,
  searchTemplatesForEditor,
  getTemplateCategories
} from './repository/surgery-template'

// Custom APIs for renderer
export const api = {
  createNewPatient,
  getPatientById,
  updatePatientById,
  listPatients,
  findPatientByPHN,
  deletePatientById,

  createNewDoctor,
  getDoctorById,
  updateDoctorById,
  listDoctors,
  deleteDoctorById,

  createNewSurgery,
  getSurgeryById,
  lookupSurgery,
  listSurgeries,
  updateSurgery,
  updateSurgeryDoctorsAssistedBy,
  updateSurgeryDoctorsDoneBy,
  deleteSurgeryById,

  createNewFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getFollowUpsBySurgeryId,

  getAllSettings,
  updateSetting,
  updateSettings,

  createSurgeryTemplate,
  getSurgeryTemplateById,
  updateSurgeryTemplateById,
  deleteSurgeryTemplateById,
  listSurgeryTemplates,
  searchTemplatesForEditor,
  getTemplateCategories
}

export type ApiType = typeof api

export const registerApi = () => {
  ipcMain.handle('invokeApiCall', async (_event, method: keyof ApiType, ...args: any[]) => {
    try {
      log.info('invoking api:', { method, args })
      const fn = api[method] as any
      if (!fn) {
        throw new Error(`Method ${method} not found in api`)
      }

      // apply the arguments to the function
      const result = await fn(...args)
      return { result }
    } catch (error) {
      log.error('Error invoking api:', method, error)

      return { error: encodeError(error) }
    }
  })
}
