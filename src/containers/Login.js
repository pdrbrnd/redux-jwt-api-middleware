import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { login } from "../actions/login"
import { getIsLoading, getError } from "../reducers/login"

import "./Login.css"

class Login extends Component {
  state = { email: "", password: "" }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { email, password } = this.state

    this.props.login({ email, password })
  }

  render() {
    const { email, password } = this.state
    const { loading, error } = this.props
    const isEmpty = !email || !password

    return (
      <form onSubmit={this.handleSubmit} className="login-form">
        <input
          placeholder="Type email"
          type="email"
          name="email"
          value={email}
          onChange={this.handleChange}
          autoComplete="email"
        />
        <input
          placeholder="Type password"
          type="password"
          name="password"
          value={password}
          onChange={this.handleChange}
          autoComplete="current-password"
        />
        {error.message && <p className="login-form__error">{error.message}</p>}
        <input type="submit" value="Login" disabled={isEmpty || loading} />
      </form>
    )
  }
}

Login.propTypes = {
  loading: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
  error: PropTypes.shape({
    id: PropTypes.number,
    message: PropTypes.string
  }).isRequired
}

export default connect(
  state => ({ loading: getIsLoading(state), error: getError(state) }),
  { login }
)(Login)
