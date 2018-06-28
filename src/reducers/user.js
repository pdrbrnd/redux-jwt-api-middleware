import { types } from "../actions/login"

export default (state = {}, action) => {
  switch (action.type) {
    case types.LOGIN_COMPLETE:
      return action.payload
    case types.LOGOUT:
      return {}
    default:
      return state
  }
}

export const getUser = state => state.user
