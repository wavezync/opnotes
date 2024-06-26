import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import Root from './routes/root'
import Home from './routes/home'
import ErrorPage from './components/common/ErrorComponent'
import { AddNewSurgery } from './routes/surgeries/add-surgery'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PatientsIndex } from './routes/patients/list-patients'
import { AddNewPatient } from './routes/patients/add-new-patient'
import { ViewPatient, loader as patientLoader } from './routes/patients/view-patient'
import { BreadcrumbProvider } from './contexts/BreadcrumbContext'
import { EditPatient } from './routes/patients/edit-patient'
import { EditSurgery } from './routes/surgeries/edit-surgery'
import { ViewSurgery } from './routes/surgeries/view-surgery'
import { DoctorsIndex } from './routes/doctors/list-doctors'
import { AddNewDoctor } from './routes/doctors/add-doctor'
import { EditDoctor } from './routes/doctors/edit-doctor'
import { SurgierisIndex } from './routes/surgeries/list-surgeries'
import { SettingsIndex } from './routes/settings/settings-index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10
    }
  }
})

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/patients',
        element: <PatientsIndex />
      },
      {
        path: '/patients/add',
        element: <AddNewPatient />
      },
      {
        path: '/patients/:id',
        loader: patientLoader(queryClient),
        element: <ViewPatient />
      },
      {
        path: '/patients/:id/edit',
        element: <EditPatient />
      },
      {
        path: '/patients/:patientId/surgeries/add',
        element: <AddNewSurgery />
      },
      {
        path: '/patients/:patientId/surgeries/:surgeryId',
        element: <ViewSurgery />
      },
      {
        path: '/patients/:patientId/surgeries/:surgeryId/edit',
        element: <EditSurgery />
      },

      {
        path: '/doctors',
        element: <DoctorsIndex />
      },
      {
        path: '/doctors/add',
        element: <AddNewDoctor />
      },
      {
        path: '/doctors/:id/edit',
        element: <EditDoctor />
      },

      {
        path: '/surgeries',
        element: <SurgierisIndex />
      },

      {
        path: '/settings',
        element: <SettingsIndex />
      },

      {
        path: '*',
        element: <ErrorPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BreadcrumbProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools position="bottom" />
      </BreadcrumbProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
