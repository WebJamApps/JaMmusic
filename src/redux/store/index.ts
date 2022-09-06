import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import storageSession from 'redux-persist/lib/storage/session';
import allReducers from '../allReducers';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  blacklist: ['sc', 'tour', 'image'],
};
let mWares = applyMiddleware(thunk);
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({ predicate: (_getState, action) => action.type !== 'SC_HEARTBEAT' });
  mWares = applyMiddleware(thunk, logger);
}
const persistedReducer = persistReducer(persistConfig, allReducers);
const store = createStore(persistedReducer, mWares);
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('../allReducers', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, node/no-missing-require, global-require
    const nextRootReducer = require('../allReducers').default;
    store.replaceReducer(
      persistReducer(persistConfig, nextRootReducer),
    );
  });
}
const persistor = persistStore(store);
export default { store, persistor };
