/* eslint-disable import/no-extraneous-dependencies, global-require */
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension"

import reducers from "../reducers"
import apiMiddleware from "../middleware/api"
import Auth from "../lib/auth"

const configureStore = preloadedState => {
  const middleware = [
    thunk,
    apiMiddleware({
      auth: new Auth(),
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
    composeWithDevTools(applyMiddleware(...middleware))
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("../reducers", () => {
      const nextRootReducer = require("../reducers").default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}

export default configureStore
