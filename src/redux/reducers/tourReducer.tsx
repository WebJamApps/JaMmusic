const initialState = {
  tour: [],
  tourUpdated: false,
  editTour: {},
};

const addTour = (state: {tour: {datetime: string}[]}, action: {data?: {datetime: string}}) => {
  const tArr = state.tour;
  tArr.push(action.data);
  // @ts-ignore
  tArr.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  return { ...state, tour: tArr, tourUpdated: true };
};

const reducer = (state = initialState, action: {type: string; data?: {datetime: string; _id: string}}) => {
  switch (action.type) {
    case 'NEW_TOUR': return addTour(state, action);
    case 'ALL_TOUR': return { ...state, tour: action.data, tourUpdated: false };
    case 'RESET_TOUR': return { ...state, tourUpdated: false };
    case 'EDIT_TOUR': return { ...state, editTour: action.data };
    default: return state;
  }
};

export default reducer;
