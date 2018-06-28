import { auth } from ".."

export const types = {
  LOGIN_START: "LOGIN_START",
  LOGIN_COMPLETE: "LOGIN_COMPLETE",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT"
}

export const login = ({ email, password }) => ({
  callAPI: api => api.post("/retailer/auth/login", { email, password }),
  types: [
    types.LOGIN_START,
    {
      type: types.LOGIN_COMPLETE,
      payload: ({ data }) => {
        auth.login({
          data: data.user,
          accessToken: data.jwt,
          refreshToken: data.jwt_refresh
        })
        return data.user
      }
    },
    {
      type: types.LOGIN_ERROR,
      payload: error => error.data.error
    }
  ]
})

export const logout = () => dispatch => {
  auth.logout()
  dispatch({ type: types.LOGOUT })
}
