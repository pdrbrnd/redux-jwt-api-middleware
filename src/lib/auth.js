import storage from "./localStorage"

class Auth {
  constructor(config = {}) {
    this.user = config.user || "auth_user"
    this.accessToken = config.accessToken || "authToken_access"
    this.refreshToken = config.refreshToken || "authToken_refresh"
  }

  login = ({ user, accessToken, refreshToken }) => {
    if (user) this.saveUser(user)
    if (accessToken) this.saveToken(accessToken)
    if (refreshToken) this.saveRefreshToken(refreshToken)
  }

  logout = () => {
    storage.removeItem(this.user)
    storage.removeItem(this.accessToken)
    storage.removeItem(this.refreshToken)
  }

  isAuthed = () => !!storage.getItem(this.accessToken)

  saveToken = token => storage.setItem(this.accessToken, token)

  saveRefreshToken = token => storage.setItem(this.refreshToken, token)

  saveUser = state => {
    const serializedState = JSON.stringify(state)

    storage.setItem(this.user, serializedState)
  }

  getUser = () => {
    try {
      const serializedState = storage.getItem(this.user)

      if (serializedState === null) {
        return undefined
      }

      return JSON.parse(serializedState)
    } catch (err) {
      return undefined
    }
  }

  getToken = () => storage.getItem(this.accessToken)

  getRefreshToken = () => storage.getItem(this.refreshToken)
}

export default Auth
