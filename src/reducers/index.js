import { combineReducers } from "redux"

const todoReducer = (state = [], action) => {
  if (action.type === "ADD_TODO") {
    return [...state, action.payload]
  }

  return state
}

export default combineReducers({
  todos: todoReducer
})
