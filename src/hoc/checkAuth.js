import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || "Component"

const checkAuth = ({
  requireAuthentication = true,
  redirectTo = "/login",
  mapIsAuthedToProps = state => !!state.authData
}) => WrappedComponent => {
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
        (!requireAuthentication && this.props.isAuthed) ||
        (requireAuthentication && !this.props.isAuthed)

      if (shouldRedirect) this.setState({ redirect: true })
    }

    render() {
      return this.state.redirect ? (
        <Redirect to={redirectTo} />
      ) : (
        <WrappedComponent {...this.props} />
      )
    }
  }

  CheckAuth.displayName = `checkAuth(${getDisplayName(WrappedComponent)})`

  CheckAuth.propTypes = { isAuthed: PropTypes.bool.isRequired }

  return connect(state => ({ isAuthed: mapIsAuthedToProps(state) }))(CheckAuth)
}

export default checkAuth
