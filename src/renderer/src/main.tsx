import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import Root from './routes/root'
import Home from './routes/home'
import ErrorPage from './components/common/ErrorComponent'
import { AddNew } from './routes/surgeries/add'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PatientsIndex } from './routes/patients'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10
    }
  }
})

const router = createMemoryRouter([
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
        path: '/new',
        element: <AddNew />
      },
      {
        path: '/patients',
        element: <PatientsIndex />
      },
      {
        path: '/search',
        element: <div>Search</div>
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools position="bottom" />
    </QueryClientProvider>
  </React.StrictMode>
)
