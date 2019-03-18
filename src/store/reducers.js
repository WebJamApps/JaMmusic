
import { combineReducers } from 'redux';
import { UPDATE_NAME } from './actions';


const nameReducer = (state = 'Web JAM LLC', action) => {
  switch (action.type) {
    case UPDATE_NAME:
      return action.data;
    default:
      return state;
  }
};

export default combineReducers({ name: nameReducer });
