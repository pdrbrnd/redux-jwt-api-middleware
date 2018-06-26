import axios from "axios"
import storage from "../lib/localStorage"

class APIMiddleware {
  constructor(config, action, dispatch, getState) {
    this.accessTokenKey = config.accessTokenKey || "JWT_ACCESS_TOKEN"
    this.refreshTokenKey = config.refreshTokenKey || "JWT_REFRESH_TOKEN"
    this.tokenLifespan = config.tokenLifespan || 1200
    this.action = action
    this.dispatch = dispatch
    this.getState = getState

    this.axiosInstance = axios.create({ baseURL: config.baseUrl })
    this.axiosInstance.interceptors.request.use(
      axiosConfig => {
        axiosConfig.headers.authorization = storage.getItem(this.accessTokenKey) // eslint-disable-line no-param-reassign
        return axiosConfig
      },
      error => Promise.reject(error)
    )
  }

  dispatchResponse = ({ type, meta, response, error }) => {
    this.dispatch({
      meta,
      // if the type is an object, we expect the 'payload' key to be a
      // function. Execute it injecting the response, dispatch and state.
      payload:
        typeof type === "string"
          ? response
          : type.payload(response, this.dispatch, this.getState()),
      type: typeof type === "string" ? type : type.type,
      error
    })
  }

  makeAPICall = async () => {
    const { callAPI, meta = {} } = this.action
    const [START, SUCCESS, ERROR] = this.action.types

    this.dispatchResponse({ type: START, meta })

    callAPI(this.axiosInstance, this.getState())
      .then(response =>
        this.dispatchResponse({
          type: SUCCESS,
          meta,
          response,
          error: false
        })
      )
      .catch(error => {
        this.dispatchResponse({
          type: ERROR,
          meta,
          response: error,
          error: true
        })
      })
  }

  call() {
    // check here if the token should be refreshed
    this.makeAPICall()
  }
}

const middleware = config => ({ dispatch, getState }) => next => action => {
  const { types, shouldCallAPI = () => true } = action

  if (!types) return next(action)
  if (!shouldCallAPI(getState())) return next(action)

  const api = new APIMiddleware(config, action, dispatch, getState)

  return api.call()
}

export default middleware
