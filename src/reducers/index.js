import { combineReducers } from "redux"

import { types } from "../actions/login"
import createDataReducer from "../lib/createDataReducer"

import login from "./login"
import profile from "./profile"

export default combineReducers({
  authData: createDataReducer({
    addDataType: types.LOGIN_COMPLETE,
    removeDataType: types.LOGOUT
  }),
  login,
  profile
})
