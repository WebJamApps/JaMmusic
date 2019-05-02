import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import store from './store';

import '../static/styles.css';

render(
  <Provider store={store.store}>
    <PersistGate loading={null} persistor={store.persistor}>
      <App />
    </PersistGate>
  </Provider>, document.getElementById('root')
);
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') module.hot.accept();
