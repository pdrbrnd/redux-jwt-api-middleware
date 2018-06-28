import { combineReducers } from "redux"

import login from "./login"
import user from "./user"
import profile from "./profile"

export default combineReducers({ user, login, profile })
