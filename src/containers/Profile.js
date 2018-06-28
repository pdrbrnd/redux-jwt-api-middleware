import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { logout } from "../actions/login"
import { fetchProfile } from "../actions/profile"
import { getIsLoading } from "../reducers/profile"
import { getUser } from "../reducers/user"

const Profile = props => (
  <div>
    <h1>{props.user.full_name}</h1>
    <h1>{props.user.email}</h1>

    <button onClick={props.logout}>Logout</button>
    <button onClick={() => props.fetchProfile(props.user.id)}>
      {!props.loading ? "Fetch profile" : "Fetching..."}
    </button>
  </div>
)

Profile.propTypes = {
  logout: PropTypes.func.isRequired,
  fetchProfile: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    full_name: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  loading: PropTypes.bool.isRequired
}

export default connect(
  state => ({
    loading: getIsLoading(state),
    user: getUser(state)
  }),
  { logout, fetchProfile }
)(Profile)
