const image: { picTitle: string, picUrl: string, }[] = [];
const initialState = {
  image,
  imageUpdated: false,
  editPic: {},
};

const reducer = (state = initialState, action: { type: string; data?: { title: string, url: string, _id: string } }): Record<string, unknown> => {
  switch (action.type) {
    case 'EDIT_PIC': return { ...state, editPic: action.data };
    default: return state;
  }
};

export default reducer;
