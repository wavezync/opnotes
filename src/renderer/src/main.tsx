import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, createMemoryRouter } from 'react-router-dom'
import Root from './routes/root'
import Home from './routes/home'
import ErrorPage from './components/common/ErrorComponent'
import { AddNew } from './routes/surgeries/add-surgery'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PatientsIndex } from './routes/patients/list-patients'
import { AddNewPatient } from './routes/patients/add-new-patient'
import { ViewPatient } from './routes/patients/view-patient'
import { BreadcrumbContext, BreadcrumbProvider } from './contexts/BreadcrumbContext'
import { EditPatient } from './routes/patients/edit-patient'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10
    }
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
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
        element: <ViewPatient />
      },
      {
        path: '/patients/:id/edit',
        element: <EditPatient />
      },
      {
        path: '/patients/:id/surgeries/add',
        element: <AddNew />
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
