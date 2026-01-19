import { createQueryKeyStore } from '@lukemorales/query-key-factory'
import {
  ActivityLogFilter,
  DoctorFilter,
  DoctorSurgeryFilter,
  PatientFilter,
  SurgeryFilter,
  SurgeryTemplateFilter,
  PrintTemplateFilter,
  TemplateType
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
    }),
    surgeries: (doctorId: number, filter: DoctorSurgeryFilter) => ({
      queryKey: [doctorId, filter],
      queryFn: () => unwrapResult(window.api.invoke('listSurgeriesByDoctorId', doctorId, filter))
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
  },
  dashboard: {
    stats: {
      queryKey: null,
      queryFn: () => unwrapResult(window.api.invoke('getDashboardStats'))
    },
    recentActivity: (limit: number = 10) => ({
      queryKey: [limit],
      queryFn: () => unwrapResult(window.api.invoke('getRecentActivities', limit))
    })
  },
  activityLog: {
    list: (filter: ActivityLogFilter) => ({
      queryKey: [filter],
      queryFn: () => unwrapResult(window.api.invoke('listActivityLog', filter))
    })
  },
  printTemplates: {
    list: (filter: PrintTemplateFilter = {}) => ({
      queryKey: [filter],
      queryFn: () => unwrapResult(window.api.invoke('listPrintTemplates', filter))
    }),
    get: (id: number) => ({
      queryKey: [id],
      queryFn: () => unwrapResult(window.api.invoke('getPrintTemplateById', id))
    }),
    getDefault: (type: TemplateType) => ({
      queryKey: [type],
      queryFn: () => unwrapResult(window.api.invoke('getDefaultPrintTemplate', type))
    }),
    defaults: (type?: TemplateType) => ({
      queryKey: ['defaults', type],
      queryFn: () => unwrapResult(window.api.invoke('listDefaultPrintTemplates', type))
    })
  }
})
