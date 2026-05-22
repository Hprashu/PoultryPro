export function redirectToLocalhostForGoogleAuth() {
  if (typeof window === 'undefined') return false

  const { hostname, port, pathname, search, hash } = window.location
  if (hostname !== '127.0.0.1') return false

  const target = `http://localhost${port ? `:${port}` : ''}${pathname}${search}${hash}`
  window.location.replace(target)
  return true
}

export function getAuthErrorMessage(error) {
  if (error?.code === 'auth/unauthorized-domain') {
    return 'Google sign-in is not allowed on this domain. Use http://localhost:5173 or add this domain in Firebase Authentication settings.'
  }

  return null
}
