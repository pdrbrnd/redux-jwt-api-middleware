export const getInfoTypes = {
  START: "GET_INFO_START",
  COMPLETE: "GET_INFO_COMPLETE",
  ERROR: "GET_INFO_ERROR"
}

export const fetchInfo = () => ({
  callAPI: api => api.get("/retailer/user/1"),
  types: [
    getInfoTypes.START,
    {
      type: getInfoTypes.COMPLETE,
      payload: response => response.data
    },
    getInfoTypes.ERROR
  ]
})
