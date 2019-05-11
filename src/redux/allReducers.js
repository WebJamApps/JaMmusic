import { combineReducers } from 'redux';
import imagesReducer from '../store/fetchReducers';

const reducer = combineReducers({
  images: imagesReducer,
});

export default reducer;
