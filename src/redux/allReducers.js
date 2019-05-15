import { combineReducers } from 'redux';
import imagesReducer from '../store/fetchReducers';
import authReducer from './reducers/authReducer';

const reducer = combineReducers({
  images: imagesReducer,
  auth: authReducer,
  songs: [],
});

export default reducer;
