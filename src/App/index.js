import PropTypes from 'prop-types';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
// import HomePage from './HomePage';
import DefaultMusic from '../containers/Music';
import BuyMusic from '../containers/BuyMusic';
import ShopMain from '../containers/Shop/ShopMain';
import AppFourOhFour from './404';
import AppTemp from './app-main';
import DefaultOriginals from '../containers/Originals';
import connectToSC from './connectToSC';
import mapStoreToProps from '../redux/mapStoreToProps';
import getSongs from './songsActions';
import getImages from './imageActions';

export class App extends Component {
  constructor(props) {
    super(props);
    this.connectToSC = connectToSC;
  }

  componentDidMount() {
    const { dispatch, songs, images } = this.props;
    this.connectToSC.setupSocketCluster(dispatch);
    // fetch songs and images
    if (songs.length === 0)dispatch(getSongs());
    if (images.length === 0)dispatch(getImages());
  }

  render() {
    return (
      <div id="App" className="App">
        <Router>
          <AppTemp id="homepage">
            <Switch>
              <Route exact path="/music" component={DefaultMusic} />
              <Route path="/music/buymusic" component={BuyMusic} />
              <Route path="/music/originals" component={DefaultOriginals} />
              <Route path="/shop" component={ShopMain} />
              <Route component={AppFourOhFour} />
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  songs: PropTypes.arrayOf(PropTypes.shape({})),
  images: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.shape({})]),

};
App.defaultProps = { songs: [], images: [] };

export default connect(mapStoreToProps, null)(App);
