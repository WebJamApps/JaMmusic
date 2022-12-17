import { combineReducers } from 'redux';
import socketReducer from './reducers/socketReducer';
import tableReducer from './reducers/tableReducer';

const reducer = combineReducers({
  sc: socketReducer,
  showTable: tableReducer,
});

export default reducer;
