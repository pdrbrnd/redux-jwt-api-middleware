import { types } from "../actions/profile"

const initialState = {
  loading: false,
  error: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PROFILE_START:
      return { ...state, loading: true }
    case types.FETCH_PROFILE_ERROR:
      return { ...initialState, error: action.payload }
    case types.FETCH_PROFILE_COMPLETE:
      return initialState
    default:
      return state
  }
}

export const getIsLoading = state => state.profile.loading
export const getError = state => state.profile.error
