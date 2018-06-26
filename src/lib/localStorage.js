/* global localStorage */
export default class storage {
  constructor(stateKey = "__redux_state__") {
    this.stateKey = stateKey
  }

  loadState = () => {
    try {
      const serializedState = localStorage.getItem(this.stateKey)

      if (serializedState === null) {
        return undefined
      }

      return JSON.parse(serializedState)
    } catch (err) {
      return undefined
    }
  }

  saveState = state => {
    try {
      const serializedState = JSON.stringify(state)

      return localStorage.setItem(this.stateKey, serializedState)
    } catch (err) {
      return undefined
    }
  }

  loadKey = key => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      return undefined
    }
  }

  saveKey = (key, value) => {
    try {
      return localStorage.setItem(key, value)
    } catch (error) {
      return undefined
    }
  }
}
