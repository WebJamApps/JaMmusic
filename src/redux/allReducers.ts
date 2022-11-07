import { combineReducers } from 'redux';
import imagesReducer from './reducers/imagesReducer';
import socketReducer from './reducers/socketReducer';
import tableReducer from './reducers/tableReducer';
import pictureReducer from './reducers/pictureReducer';

const reducer = combineReducers({
  images: imagesReducer,
  sc: socketReducer,
  showTable: tableReducer,
  image: pictureReducer,
});

export default reducer;
