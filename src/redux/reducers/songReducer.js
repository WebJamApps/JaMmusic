const initialState = {
  songs: [],
  error: '',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GOT_SONGS':
      return {
        ...state,
        songs: action.data,
        error: '', 
      };
    default:
      return state;
  }
};

export default reducer;
