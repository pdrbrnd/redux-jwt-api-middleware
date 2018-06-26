import React from "react"
import { Switch, Route, Link } from "react-router-dom"

export default () => (
  <div>
    <Switch>
      <Route
        exact
        path="/"
        render={() => (
          <div>
            <h1>Hello world from Home</h1>
            <Link to="/about">About</Link>
          </div>
        )}
      />
      <Route
        exact
        path="/about"
        render={() => (
          <div>
            <h1>Hello world from About</h1>
            <Link to="/">Home</Link>
          </div>
        )}
      />
    </Switch>
  </div>
)
