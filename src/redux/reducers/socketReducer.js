const initialState = {
  userCount: 0,
  heartBeat: 'white',
  scc: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SCC': return { ...state, scc: action.scc };
    case 'NUM_USERS': return { ...state, userCount: action.numbUsers };
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
