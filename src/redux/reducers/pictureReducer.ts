import type { Iimage } from '../mapStoreToProps';

const initialState = {
  editPic: {},
};

const reducer = (state = initialState, action: { type: string; data?: { title: string, url: string } }): Record<string, unknown> => {
  switch (action.type) {
    case 'EDIT_PIC': return { ...state, editPic: action.data };
    default:
      return state;
  }
};

export default reducer;
