import checkAuth from "./checkAuth"

const mapIsAuthedToProps = state => Object.keys(state.authData).length > 0

export const requireAuth = checkAuth({
  mapIsAuthedToProps
})

export const requireGuest = checkAuth({
  mapIsAuthedToProps,
  requireAuthentication: false,
  redirectTo: "/profile"
})
