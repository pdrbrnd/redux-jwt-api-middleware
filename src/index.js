/* global document */
/* eslint import/prefer-default-export: 0 */
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"

import "./reset.css"
import "./index.css"

import App from "./components/App"
import configureStore from "./store/configureStore"
import Auth from "./lib/auth"

export const auth = new Auth()

ReactDOM.render(
  <Provider store={configureStore({ user: auth.getUser() || {} })}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
)
