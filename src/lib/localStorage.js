/* global localStorage */
export default {
  getItem: key => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      return undefined
    }
  },
  setItem: (key, value) => {
    try {
      return localStorage.setItem(key, value)
    } catch (error) {
      return undefined
    }
  }
}
