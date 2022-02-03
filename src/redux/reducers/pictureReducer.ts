const initialState = {
  editPic: {},
};
// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: { type: string; data?: { title: string, url: string, _id: string } }): Record<string, unknown> => {
  switch (action.type) {
    case 'EDIT_PIC': return { ...state, editPic: action.data };
    default: return state;
  }
};

export default reducer;
