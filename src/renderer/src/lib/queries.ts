import { createQueryKeyStore } from '@lukemorales/query-key-factory'
import {
  DoctorFilter,
  PatientFilter,
  SurgeryFilter,
  SurgeryTemplateFilter
} from 'src/shared/types/api'
import { unwrapResult } from './utils'

export const queries = createQueryKeyStore({
  patients: {
    list: (patientFilter: PatientFilter) => ({
      queryKey: [patientFilter],
      queryFn: () => unwrapResult(window.api.invoke('listPatients', patientFilter))
    }),
    get: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getPatientById', id))
    })
  },
  surgeries: {
    list: (filter: SurgeryFilter) => ({
      queryKey: [filter],
      queryFn: () => unwrapResult(window.api.invoke('listSurgeries', filter))
    }),
    get: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getSurgeryById', id))
    }),
    getFollowups: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getFollowUpsBySurgeryId', id))
    })
  },
  doctors: {
    list: (filter: DoctorFilter) => ({
      queryKey: [filter],
      queryFn: () => unwrapResult(window.api.invoke('listDoctors', filter))
    }),
    get: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getDoctorById', id))
    })
  },
  app: {
    version: {
      queryKey: null,
      queryFn: () => window.electronApi.getAppVersion()
    },
    settings: {
      queryKey: null,
      queryFn: () => unwrapResult(window.api.invoke('getAllSettings'))
    }
  },
  surgeryTemplates: {
    list: (filter: SurgeryTemplateFilter) => ({
      queryKey: [filter],
      queryFn: () => unwrapResult(window.api.invoke('listSurgeryTemplates', filter))
    }),
    get: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getSurgeryTemplateById', id))
    }),
    forEditor: (params: {
      search?: string
      doctorId?: number
      category?: string
      tag?: string
    }) => ({
      queryKey: [params],
      queryFn: () => unwrapResult(window.api.invoke('searchTemplatesForEditor', params))
    }),
    categories: {
      queryKey: null,
      queryFn: () => unwrapResult(window.api.invoke('getTemplateCategories'))
    },
    tags: {
      queryKey: null,
      queryFn: () => unwrapResult(window.api.invoke('getTemplateTags'))
    }
  },
  backup: {
    list: {
      queryKey: null,
      queryFn: () => unwrapResult(window.api.invoke('listBackups'))
    }
  }
})
