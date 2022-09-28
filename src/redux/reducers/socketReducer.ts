interface ISocketReducer {
  scc: Record<string, unknown>, userCount: number, heartBeat: string
}

const initialState = {
  userCount: 0,
  heartBeat: 'white',
  scc: {},
};

const reducer = (
  state: ISocketReducer,
  action: { type: string; scc: Record<string, unknown>;
    data: string },
): ISocketReducer => {
  if (!state) state = initialState;
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
