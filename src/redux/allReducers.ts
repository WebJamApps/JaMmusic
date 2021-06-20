import { combineReducers } from 'redux';
import imagesReducer from './reducers/imagesReducer';
import authReducer from './reducers/authReducer';
import socketReducer from './reducers/socketReducer';
import tourReducer from './reducers/tourReducer';
import tableReducer from './reducers/tableReducer';
import pictureReducer from './reducers/pictureReducer';

const reducer = combineReducers({
  images: imagesReducer,
  auth: authReducer,
  sc: socketReducer,
  tour: tourReducer,
  showTable: tableReducer,
  image: pictureReducer,
});

export default reducer;
