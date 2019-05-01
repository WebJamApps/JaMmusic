
import { combineReducers } from 'redux';
import {
  UPDATE_NAME, UPDATE_ROLE, UPDATE_WIDESCREEN, UPDATE_MENU, UPDATE_FULLMENU 
} from './actions';

const nameReducer = (state = 'WebJAM LLC', action) => {
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

const fullmenuReducer = (state = true, action) => {
  switch (action.type) {
  case UPDATE_FULLMENU:
    return action.fullmenu;
  default:
    return state;
  }
};

export default combineReducers({
  name: nameReducer,
  role: roleReducer,
  widescreen: widescreenReducer,
  fullMenu: fullmenuReducer,
  menu: menuReducer
});
