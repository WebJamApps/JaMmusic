import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Music from './containers/music';
import BuyMusic from './containers/buymusic';
import AppFourOhFour from './containers/404';
import AppTemp from './components/app-main';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div id="App" className="App">
        <Router>
          <AppTemp id="homepage">
            <Switch>
              <Route exact path="/music" component={ Music }/>
              <Route path="/music/buymusic" component={ BuyMusic }/>
              <Route component={ AppFourOhFour }/>
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
