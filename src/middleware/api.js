import axios from "axios"
import decode from "jwt-decode"

import Auth from "../lib/auth"

// time of life (in seconds) required to do a refresh
const TIME_REQUIRED_TO_REFRESH = 300

class APIMiddleware {
  constructor(config, action, dispatch, getState) {
    /* 
    Config (Object)
    - auth (Class instance)
      Use Auth class to initialize new auth instance
      Auth's constructor accepts an object with two keys:
      - accessToken (String): localStorage's key to save access token
      - refreshToken (String): localStorage's key to save refresh token

    - baseUrl (String)
      The API's base url. e.g.: http://localhost:3000 (no trailing slash)

    - parseToken (Function. Arguments: token)
      The function to give the token to the authorization header
      Should return a string

    - makeRefreshTokenCall (Function. Arguments: axiosInstance, token)
      The function to get a new refresh token
      Should return a Promise

    - getTokensFromResponse (Function. Arguments: responseData)
      The function to get the tokens from the API response
      Should return an object with the keys 'accessToken' and 'refreshToken'
    */

    // Auth class instance
    this.auth = config.auth || new Auth()

    // Axios instance with baseURL set
    this.axiosInstance = axios.create({ baseURL: config.baseUrl || "" })

    // Function to parse tokens in request headers
    this.parseToken = config.parseToken
      ? config.parseToken
      : token => `Bearer ${token}`

    // Function to get a new token
    this.curriedMakeRefreshTokenCall = config.makeRefreshTokenCall
      ? config.makeRefreshTokenCall.bind(this, this.axiosInstance)
      : token => {
          this.axiosInstance.post("/refresh", { jwt_refresh: token })
        }

    // Function to get tokens from refresh response
    this.getTokensFromResponse =
      config.getTokensFromResponse ||
      (res => ({ accessToken: res.jwt, refreshToken: res.jwt_refresh }))

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
            Authorization:
              config.headers.authorization || this.parseToken(token)
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

  shouldRefreshToken = token => {
    const now = Math.round(new Date().getTime() / 1000)
    const tokenExp = decode(token).exp
    const diff = tokenExp - now

    // If the difference between expiry and now (UNIX)
    // is less than the required time to refresh
    // we should request a new token
    return diff < TIME_REQUIRED_TO_REFRESH
  }

  refreshToken = async () =>
    this.curriedMakeRefreshTokenCall(this.auth.getRefreshToken())

  saveToken = res => {
    if (res.status !== 200 || !res.data) {
      return null
    }

    const { accessToken, refreshToken } = this.getTokensFromResponse(res.data)

    this.auth.login(accessToken, refreshToken)
    return accessToken
  }

  call() {
    const token = this.auth.getToken()

    if (!token) {
      this.makeRequest()
    }

    if (this.shouldRefreshToken(token)) {
      this.refreshToken()
        .then(this.saveToken)
        .then(this.makeRequest)
    } else {
      this.makeRequest(token)
    }
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
