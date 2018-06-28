import React from "react"
import { Switch, Route } from "react-router-dom"
import Home from "../../views/Home"
import { requireAuth, requireGuest } from "../../hoc/checkAuth"
import Login from "../../views/Login"
import Profile from "../../views/Profile"

export default () => (
  <div>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/profile" component={requireAuth(Profile)} />
      <Route exact path="/login" component={requireGuest(Login)} />
    </Switch>
  </div>
)
