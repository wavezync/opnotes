export const encodeError = (e) => {
  return { name: e.name, message: e.message, extra: { ...e } }
}
