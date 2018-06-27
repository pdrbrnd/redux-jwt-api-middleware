import axios from "axios"
import storage from "../lib/localStorage"

class APIMiddleware {
  constructor(config, action, dispatch, getState) {
    /* 
    Config
    - baseUrl (String)
    - tokenKey (String)
    - tokenLifespan (Integer)
    - getToken (Function)
    */

    // Token settings
    this.tokenKey = config.tokenKey || "authToken"
    this.tokenLifespan = config.tokenLifespan || 1200
    this.getToken = config.getToken
      ? config.getToken
      : token => `Bearer ${token}`
    this.accessTokenKey = `${this.tokenKey}_ac`
    this.refreshTokenKey = `${this.tokenKey}_rf`

    // Requests settings
    this.axiosInstance = axios.create({ baseURL: config.baseUrl })

    // Middleware stuff
    this.action = action
    this.dispatch = dispatch
    this.getState = getState
  }

  dispatchAction = ({ type, meta, response, error }) => {
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

  makeRequest = async token => {
    const { callAPI, meta = {} } = this.action
    const [START, SUCCESS, ERROR] = this.action.types

    // Add token to authorization header
    if (token) {
      this.axiosInstance.interceptors.request.use(
        config => ({
          ...config,
          headers: {
            ...config.headers,
            Authorization: config.headers.authorization || this.getToken(token)
          }
        }),
        error => Promise.reject(error)
      )
    }

    this.dispatchAction({ type: START, meta })

    callAPI(this.axiosInstance, this.getState())
      .then(response =>
        this.dispatchAction({
          type: SUCCESS,
          meta,
          response,
          error: false
        })
      )
      .catch(error => {
        this.dispatchAction({
          type: ERROR,
          meta,
          response: error,
          error: true
        })
      })
  }

  call() {
    // check here if the token should be refreshed
    this.makeRequest(storage.getItem(this.accessTokenKey))
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
