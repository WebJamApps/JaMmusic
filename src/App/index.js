import PropTypes from 'prop-types';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import HomePage from './HomePage';
import DefaultMusic from '../containers/Music';
import BuyMusic from '../containers/BuyMusic';
import ShopMain from '../containers/Shop/ShopMain';
import AppFourOhFour from './404';
import AppTemp from './app-main';
import DefaultOriginals from '../containers/Originals';
import connectToSC from './connectToSC';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.connectToSC = connectToSC;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.connectToSC.setupSocketCluster(dispatch);
  }

  render() {
    return (
      <div id="App" className="App">
        <Router>
          <AppTemp id="homepage">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/music" component={DefaultMusic} />
              <Route path="/buymusic" component={BuyMusic} />
              <Route path="/originals" component={DefaultOriginals} />
              <Route path="/shop" component={ShopMain} />
              <Route component={AppFourOhFour} />
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
App.propTypes = { dispatch: PropTypes.func.isRequired };
const mapStoreToProps = store => ({ images: store.images, userCount: store.auth.userCount });

export default connect(mapStoreToProps, null)(App);
