const initialState = {
  tour: [],
  tourUpdated: false,
  editTour: {},
};

const modifyTour = (state: any, action: any) => {
  const tArr = state.tour;
  for (let i = 0; i < tArr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
    if (tArr[i]._id === action.data._id)tArr[i] = action.data;
  }
  return { ...state, tour: tArr, tourUpdated: true };
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
    case 'UPDATED_TOUR': return modifyTour(state, action);
    case 'ALL_TOUR': return { ...state, tour: action.data, tourUpdated: false };
    case 'RESET_TOUR': return { ...state, tourUpdated: false };
    case 'EDIT_TOUR': return { ...state, editTour: action.data };
    default: return state;
  }
};

export default reducer;
