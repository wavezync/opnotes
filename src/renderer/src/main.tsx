import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import Root from './routes/root'
import Home from './routes/home'
import ErrorPage from './components/common/ErrorComponent'
import { AddNew } from './routes/add'

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
        path: '/search',
        element: <div>Search</div>
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
