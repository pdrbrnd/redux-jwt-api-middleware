import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import reducers from "../reducers"
import apiMiddleware from "../middleware/api"
import { auth } from "../"

const configureStore = preloadedState => {
  const middleware = [
    thunk,
    apiMiddleware({
      auth,
      baseUrl: "http://13.250.110.132/api",
      parseToken: token => `Bearer ${token}`,
      makeRefreshTokenCall: (axios, token) =>
        axios.post("/retailer/auth/refresh", { jwt_refresh: token }),
      getTokenFromResponse: res => ({
        accessToken: res.jwt,
        refreshToken: res.jwt_refresh
      })
    })
  ]

  const store = createStore(
    reducers,
    preloadedState,
    applyMiddleware(...middleware)
  )

  return store
}

export default configureStore
