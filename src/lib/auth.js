import storage from "./storage"

class Auth {
  constructor(config = {}) {
    this.dataKey = config.dataKey || "auth_data"
    this.accessToken = config.accessToken || "authToken_access"
    this.refreshToken = config.refreshToken || "authToken_refresh"
    this.logoutAction = config.logoutAction || "authToken_LOGOUT"
  }

  login = ({ data, accessToken, refreshToken }) => {
    if (data) this.saveData(data)
    if (accessToken) this.saveToken(accessToken)
    if (refreshToken) this.saveRefreshToken(refreshToken)
  }

  logout = () => {
    storage.removeItem(this.dataKey)
    storage.removeItem(this.accessToken)
    storage.removeItem(this.refreshToken)
  }

  isAuthed = () => !!storage.getItem(this.accessToken)

  saveToken = token => storage.setItem(this.accessToken, token)

  saveRefreshToken = token => storage.setItem(this.refreshToken, token)

  saveData = state => {
    const serializedState = JSON.stringify(state)

    storage.setItem(this.dataKey, serializedState)
  }

  getData = () => {
    try {
      const serializedState = storage.getItem(this.dataKey)

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
