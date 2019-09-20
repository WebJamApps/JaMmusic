import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App';
import store from './redux/store';

import '../static/styles.scss';

render(
  <Provider store={store.store}>
    <PersistGate loading={null} persistor={store.persistor}>
      <ConnectedApp />
    </PersistGate>
  </Provider>, document.getElementById('root'),
);
/* istanbul ignore if */
if (process.env.NODE_ENV === 'development') module.hot.accept();
