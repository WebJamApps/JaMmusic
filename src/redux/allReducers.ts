import { combineReducers } from 'redux';
import imagesReducer from './reducers/imagesReducer';
import authReducer from './reducers/authReducer';
import socketReducer from './reducers/socketReducer';
import tourReducer from './reducers/tourReducer';
import tableReducer from './reducers/tableReducer';

const reducer = combineReducers({
  images: imagesReducer,
  auth: authReducer,
  sc: socketReducer,
  tour: tourReducer,
  showTable: tableReducer,
});

export default reducer;
