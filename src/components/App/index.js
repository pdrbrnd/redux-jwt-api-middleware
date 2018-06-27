import React from "react"
import { Switch, Route, Link } from "react-router-dom"
import App from "../../containers/App"

export default () => (
  <div>
    <Switch>
      <Route exact path="/" component={App} />
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
