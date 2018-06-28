import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || "Component"

const checkAuth = (
  config = {
    requireAuthentication: true,
    redirectTo: "/login"
  }
) => WrappedComponent => {
  class CheckAuth extends Component {
    state = { redirect: false }

    componentDidMount = () => {
      this.checkAuthentication()
    }

    componentDidUpdate = () => {
      this.checkAuthentication()
    }

    checkAuthentication = () => {
      const shouldRedirect =
        (!config.requireAuthentication && this.props.isAuthed) ||
        (config.requireAuthentication && !this.props.isAuthed)

      if (shouldRedirect) this.setState({ redirect: true })
    }

    render() {
      return this.state.redirect ? (
        <Redirect to={config.redirectTo} />
      ) : (
        <WrappedComponent {...this.props} />
      )
    }
  }

  CheckAuth.displayName = `checkAuth(${getDisplayName(WrappedComponent)})`

  CheckAuth.propTypes = { isAuthed: PropTypes.bool.isRequired }

  return connect(state => ({
    isAuthed: Object.keys(state.authData).length > 0
  }))(CheckAuth)
}

export const requireAuth = checkAuth()
export const requireGuest = checkAuth({
  requireAuthentication: false,
  redirectTo: "/profile"
})

export default checkAuth
