import { types } from "../actions/login"

const initialState = {
  loading: false,
  error: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_START:
      return { ...initialState, loading: true }
    case types.LOGIN_ERROR:
      return { ...initialState, error: action.payload }
    case types.LOGOUT:
      return initialState
    default:
      return state
  }
}

export const getIsLoading = state => state.login.loading
export const getError = state => state.login.error
