import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import reducers from "../reducers"
import apiMiddleware from "../middleware/jwtApi"

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
    applyMiddleware(...middleware)
  )

  return store
}

export default configureStore
