export default ({ addDataType, removeDataType, initialState = {} }) => (
  state = initialState,
  action
) => {
  if (action.type === addDataType) return action.payload
  if (action.type === removeDataType) return initialState
  return state
}
