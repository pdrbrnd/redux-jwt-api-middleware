export default ({ addDataTypes, removeDataTypes, initialState = {} }) => (
  state = initialState,
  action
) => {
  if (addDataTypes.indexOf(action.type) !== -1) return action.payload
  if (removeDataTypes.indexOf(action.type) !== -1) return initialState
  return state
}
