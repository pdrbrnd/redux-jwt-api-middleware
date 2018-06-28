export const types = {
  FETCH_PROFILE_START: "FETCH_PROFILE_START",
  FETCH_PROFILE_COMPLETE: "FETCH_PROFILE_COMPLETE",
  FETCH_PROFILE_ERROR: "FETCH_PROFILE_ERROR"
}

export const fetchProfile = id => ({
  callAPI: api => api.get(`/retailer/user/${id}`),
  types: [
    types.FETCH_PROFILE_START,
    {
      type: types.FETCH_PROFILE_COMPLETE,
      payload: response => response.data
    },
    types.FETCH_PROFILE_ERROR
  ]
})
