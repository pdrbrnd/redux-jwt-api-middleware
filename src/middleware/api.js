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

    - axios (Object)
      An axios instance with your desired configuration (e.g. baseUrl)

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
    this.axiosInstance = config.axios || axios.create()

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

  catchAPIErrors = error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response
    }

    if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      return error.request
    }

    // Something happened in setting up the request that triggered an Error
    return error.message
  }

  makeRequest = async token => {
    const { callAPI, meta = {} } = this.action
    const { 1: SUCCESS, 2: ERROR } = this.action.types

    // Add token to authorization header
    if (token) {
      this.axiosInstance.defaults.headers.common.Authorization = this.parseToken(
        token
      )
    }

    return new Promise((resolve, reject) => {
      callAPI(this.axiosInstance, this.getState())
        .then(response => {
          this.dispatchAction({
            type: SUCCESS,
            meta,
            response,
            error: false
          })

          return resolve(response)
        })
        .catch(error => {
          if (this.catchAPIErrors(error).status === 401) {
            this.auth.logout()
            this.dispatchAction({ type: this.auth.logoutAction })
          }

          this.dispatchAction({
            type: ERROR,
            meta,
            response: this.catchAPIErrors(error),
            error: true
          })

          return reject(error)
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

  saveToken = res =>
    new Promise(async (resolve, reject) => {
      if (res.status !== 200 || !res.data) {
        return reject(res)
      }

      const { accessToken, refreshToken } = this.getTokensFromResponse(res.data)

      if (accessToken) await this.auth.saveToken(accessToken)
      if (refreshToken) await this.auth.saveRefreshToken(refreshToken)

      return resolve(accessToken)
    })

  call = () => {
    const { meta = {} } = this.action
    const { 0: START } = this.action.types

    this.dispatchAction({ type: START, meta })

    const token = this.auth.getToken()

    if (!token) {
      return this.makeRequest()
    }

    if (this.shouldRefreshToken(token)) {
      return this.refreshToken()
        .then(this.saveToken)
        .catch(err => {
          if (this.catchAPIErrors(err).status === 401) {
            this.auth.logout()
            this.dispatchAction({ type: this.auth.logoutAction })
          }
        })
        .then(this.makeRequest)
    }

    return this.makeRequest(token)
  }
}

const middleware = config => ({ dispatch, getState }) => next => action => {
  const { types, shouldCallAPI = () => true } = action

  if (!types) return next(action)
  if (!shouldCallAPI(getState())) return new Promise(resolve => resolve())

  const api = new APIMiddleware(config, action, dispatch, getState)

  return api.call()
}

export default middleware
