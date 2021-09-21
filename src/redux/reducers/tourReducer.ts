export interface ITour {
  datetime?: string, _id?: string
}
export interface ITourState{
  tour:ITour[],
  tourUpdated: boolean,
  editTour: ITour
  editSong: Record<string, unknown>,
}

const initialState:ITourState = {
  tour: [],
  tourUpdated: false,
  editTour: {},
  editSong: { _id: '' },
};

const modifyTour = (state: ITourState, action: { data?: ITour }):ITourState => {
  const tArr = state.tour;
  for (let i = 0; i < tArr.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
    if (action.data && tArr[i]._id === action.data._id) tArr[i] = action.data;
  }
  return { ...state, tour: tArr, tourUpdated: true };
};

const addTour = (state: ITourState, action: { data: { datetime:string, _id:string } }):ITourState => {
  const tArr = state.tour as { datetime:string, _id:string }[];
  if (action.data && typeof action.data.datetime === 'string') {
    tArr.push(action.data);
    tArr.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    return { ...state, tour: tArr, tourUpdated: true };
  }
  return { ...state, tourUpdated: false };
};

const reducer = (state = initialState, action:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
{ songData?: any, type: string; data: any }): ITourState => {
  switch (action.type) {
    case 'NEW_TOUR': return addTour(state, action);
    case 'UPDATED_TOUR': return modifyTour(state, action);
    case 'ALL_TOUR': return { ...state, tour: action.data, tourUpdated: false };
    case 'RESET_TOUR': return { ...state, tourUpdated: false };
    case 'EDIT_TOUR': return { ...state, editTour: action.data };
    case 'EDIT_SONG': return { ...state, editSong: action.songData };
    default: return state;
  }
};

export default reducer;
