/* eslint-disable import/no-extraneous-dependencies, global-require */
import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension"

import reducers from "../reducers"
import apiMiddleware from "../middleware/api"

const configureStore = preloadedState => {
  const middleware = [
    thunk,
    apiMiddleware({
      baseUrl: "http://13.250.110.132/api"
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
