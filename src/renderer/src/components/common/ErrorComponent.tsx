/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError() as any
  console.error(error)

  let errorMessage = ''
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="text-center p-4 space-y-2 h-screen flex flex-col justify-center items-center rounded-lg">
      <h1 className="text-2xl font-bold">Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>

      <div className="">
        Back to{' '}
        <Link to="/" className="hover:underline">
          Home
        </Link>
      </div>
    </div>
  )
}
