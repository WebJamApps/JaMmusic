import PropTypes from 'prop-types';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultMusic from '../containers/Music';
import DefaultMusicDashboard from '../containers/MusicDashboard';
import BuyMusic from '../containers/BuyMusic';
import ShopMain from '../containers/Shop/ShopMain';
import AppFourOhFour from './404';
import AppMain from './app-main';
import DefaultOriginals from '../containers/Originals';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps from '../redux/mapStoreToProps';
import getSongs from './songsActions';
import getImages from './imageActions';

export class App extends Component {
  constructor(props) {
    super(props);
    this.connectToSC = connectToSC;
  }

  async componentDidMount() {
    const { dispatch, songs, images } = this.props;
    if (songs.length === 0)dispatch(getSongs());
    if (images.length === 0)dispatch(getImages());
    await this.connectToSC.connectToSCC(dispatch);
  }

  render() {
    const { auth } = this.props;
    return (
      <div id="App" className="App">
        <Router>
          <AppMain id="homepage">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/music" component={DefaultMusic} />
              <Route path="/music/buymusic" component={BuyMusic} />
              <Route path="/music/originals" component={DefaultOriginals} />
              {auth.isAuthenticated && auth.user.userType === 'Developer'
                ? <Route path="/music/dashboard" component={DefaultMusicDashboard} /> : null}
              <Route path="/shop" component={ShopMain} />
              <Route component={AppFourOhFour} />
            </Switch>
          </AppMain>
        </Router>
      </div>
    );
  }
}
App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  songs: PropTypes.arrayOf(PropTypes.shape({})),
  images: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.shape({})]),
  auth: PropTypes.shape({ user: PropTypes.shape({ userType: PropTypes.string }), isAuthenticated: PropTypes.bool }),
};
App.defaultProps = { songs: [], images: [], auth: { isAuthenticated: false, user: { userType: '' } } };

export default connect(mapStoreToProps, null)(App);
