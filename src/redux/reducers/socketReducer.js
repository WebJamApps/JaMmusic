const initialState = {
  userCount: 0,
  heartBeat: 'white',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NUM_USERS': return Object.assign({}, state, { userCount: action.numbUsers });
    case 'SC_HEARTBEAT': {
      let newColor = 'white';
      if (state.heartBeat === 'white') newColor = 'green';
      return Object.assign({}, state, { heartBeat: newColor });
    }
    default:
      return state;
  }
};

export default reducer;
