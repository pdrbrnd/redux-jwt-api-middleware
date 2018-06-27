import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { fetchInfo } from "../actions/info"

class App extends Component {
  handleFetchInfo = () => {
    this.props.fetchInfo()
  }

  render() {
    const { info } = this.props

    return (
      <div>
        <h1>Hello world</h1>
        <button onClick={this.handleFetchInfo} disabled={info.isFetching}>
          {!info.isFetching ? "Fetch API info" : "Fetching..."}
        </button>
        <hr />
        <h2>User email: {info.info.email}</h2>
      </div>
    )
  }
}

App.propTypes = {
  fetchInfo: PropTypes.func.isRequired,
  info: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    info: PropTypes.object
  }).isRequired
}

export default connect(
  ({ info }) => ({ info }),
  { fetchInfo }
)(App)
