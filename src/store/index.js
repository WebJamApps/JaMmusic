import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
// import reducers from './reducers';
import fetchReducers from './fetchReducers';

const persistConfig = {
  key: 'root',
  storage,
};
let mWares = applyMiddleware(thunk);
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') mWares = applyMiddleware(thunk, logger);
const persistedReducer = persistReducer(persistConfig, fetchReducers);
const store = createStore(persistedReducer, mWares);
const persistor = persistStore(store);
export default { store, persistor };
