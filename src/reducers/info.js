import { getInfoTypes } from "../actions/info"

const initialState = {
  isFetching: false,
  info: {},
  errors: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case getInfoTypes.START:
      return { ...state, isFetching: true }
    case getInfoTypes.COMPLETE:
      return { ...initialState, info: action.payload }
    case getInfoTypes.ERROR:
      return { ...initialState, errors: action.payload }
    default:
      return state
  }
}
