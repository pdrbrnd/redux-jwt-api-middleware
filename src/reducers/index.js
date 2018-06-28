import { combineReducers } from "redux"

import { types } from "../actions/login"
import createDataReducer from "../lib/createDataReducer"

import login from "./login"
import profile from "./profile"

export default combineReducers({
  authData: createDataReducer({
    addDataTypes: [types.LOGIN_COMPLETE],
    removeDataTypes: [types.LOGOUT]
  }),
  login,
  profile
})
