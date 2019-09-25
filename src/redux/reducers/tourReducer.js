const initialState = {
  tour: [],
  tourUpdated: false,
};

const addTour = (state, action) => {
  const tArr = state.tour;
  tArr.push(action.data);
  tArr.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  return { ...state, tour: tArr, tourUpdated: true };
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NEW_TOUR': return addTour(state, action);
    case 'ALL_TOUR': return { ...state, tour: action.data, tourUpdated: false };
    case 'RESET_TOUR': return { ...state, tourUpdated: false };
    default: return state;
  }
};

export default reducer;
