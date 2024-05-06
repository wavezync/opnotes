// Helper type to extract function arguments types
type ArgumentTypes<F> = F extends (...args: infer A) => any ? A : never

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// Helper type to extract function return type
type ReturnType<F> = F extends (...args: any[]) => infer R ? UnwrapPromise<R> : never

type ErrorType = {
  name: string
  message: string
  extra: object
}

type ResultType<T, E extends ErrorType> = {
  result: T
  error: E
}
