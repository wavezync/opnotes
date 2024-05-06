import { createQueryKeyStore } from '@lukemorales/query-key-factory'
import { PatientFilter } from 'src/shared/types/api'
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
  }
})
