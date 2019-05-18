import { combineReducers } from 'redux';
import {
  UPDATE_NAME, UPDATE_ROLE, UPDATE_WIDESCREEN, UPDATE_MENU,
} from './actions';

// const initialState = {
//   name: 'Web JAM LLC',
//   menu: '',
//   role: '',
//   widescreen: true
// };

const nameReducer = (state = 'Web JAM LLC', action) => {
  switch (action.type) {
    case UPDATE_NAME:
      return action.name;
    default:
      return state;
  }
};

const roleReducer = (state = '', action) => {
  switch (action.type) {
    case UPDATE_ROLE:
      return action.role;
    default:
      return state;
  }
};

const widescreenReducer = (state = true, action) => {
  switch (action.type) {
    case UPDATE_WIDESCREEN:
      return action.widescreen;
    default:
      return state;
  }
};

const menuReducer = (state = '', action) => {
  switch (action.type) {
    case UPDATE_MENU:
      return action.menu;
    default:
      return state;
  }
};

export default combineReducers({
  name: nameReducer,
  role: roleReducer,
  widescreen: widescreenReducer,
  menu: menuReducer,
});
