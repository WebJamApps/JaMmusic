interface ISocketReducer {
  scc: Record<string, unknown>, userCount: number, heartBeat: string
}

const initialState = {
  userCount: 0,
  heartBeat: 'white',
  scc: {},
};
// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (
  state = initialState,
  action: { type: string; scc: Record<string, unknown>;
    data: string },
): ISocketReducer => {
  switch (action.type) {
    case 'SCC': return { ...state, scc: action.scc };
    case 'NUM_USERS': return { ...state, userCount: parseInt(action.data, 10) };
    case 'SC_HEARTBEAT': {
      let newColor = 'white';
      if (state.heartBeat === 'white') newColor = 'green';
      return { ...state, heartBeat: newColor };
    }
    default:
      return state;
  }
};

export default reducer;
