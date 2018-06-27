import storage from "./localStorage"

class Auth {
  constructor(config = {}) {
    this.accessToken = config.accessToken || "authToken_access"
    this.refreshToken = config.refreshToken || "authToken_refresh"
  }

  login = (accessToken, refreshToken) => {
    storage.setItem(this.accessToken, accessToken)
    storage.setItem(this.refreshToken, refreshToken)
  }

  logout = () => {
    storage.removeItem(this.accessToken)
    storage.removeItem(this.refreshToken)
  }

  isAuthed = () => !!storage.getItem(this.accessToken)

  getToken = () => storage.getItem(this.accessToken)

  getRefreshToken = () => storage.getItem(this.refreshToken)
}

export default Auth
