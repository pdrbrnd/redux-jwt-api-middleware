import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"

import reducers from "../reducers"

const configureStore = preloadedState => {
  const middleware = [thunk]

  const store = createStore(
    reducers,
    preloadedState,
    applyMiddleware(...middleware)
  )

  return store
}

export default configureStore
