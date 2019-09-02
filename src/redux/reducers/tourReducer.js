const initialState = {
  tour: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ALL_TOUR':
      return {
        ...state,
        tour: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
