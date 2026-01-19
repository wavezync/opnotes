import './styles/fonts.css'
import './styles/themes.css'
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
import { ViewDoctor, loader as doctorLoader } from './routes/doctors/view-doctor'
import { EditDoctor } from './routes/doctors/edit-doctor'
import { SurgierisIndex } from './routes/surgeries/list-surgeries'
import { QuickAddSurgery } from './routes/surgeries/quick-add-surgery'
import { SupportIndex } from './routes/support/support-index'
import { SettingsIndex } from './routes/settings/settings-index'
import { TemplatesIndex } from './routes/templates/templates-index'
import { AddTemplatePage, EditTemplatePage } from './routes/templates/template-form-page'
import { PrintTemplateEditorPage } from './routes/settings/print-template-editor'
import { Navigate } from 'react-router-dom'
import { ActivityIndex } from './routes/activity/activity-index'

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
        path: '/doctors/:id',
        loader: doctorLoader(queryClient),
        element: <ViewDoctor />
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
        path: '/quick-surgery',
        element: <QuickAddSurgery />
      },

      {
        path: '/support',
        element: <SupportIndex />
      },

      {
        path: '/settings',
        element: <SettingsIndex />
      },
      {
        path: '/settings/print-templates',
        element: <Navigate to="/settings?tab=print-templates" replace />
      },

      {
        path: '/templates',
        element: <TemplatesIndex />
      },
      {
        path: '/templates/add',
        element: <AddTemplatePage />
      },
      {
        path: '/templates/:id/edit',
        element: <EditTemplatePage />
      },
      {
        path: '/settings/print-templates/:id',
        element: <PrintTemplateEditorPage />
      },

      {
        path: '/activity',
        element: <ActivityIndex />
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
