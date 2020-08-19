import { Song } from '../mapStoreToProps';

const initialState = {
  songs: [],
  error: '',
};

const reducer = (state = initialState, action: { type: string, data: Song[], error: string }): { songs: Song[], error: string} => {
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
