import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DefaultMusic from './containers/Music';
import BuyMusic from './containers/buymusic';
import AppFourOhFour from './containers/404';
import AppTemp from './components/app-main';
import Originals from './containers/Originals';

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
              <Route exact path="/music" component={DefaultMusic} />
              <Route path="/music/buymusic" component={BuyMusic} />
              <Route path="/music/originals" component={Originals} />
              <Route component={AppFourOhFour} />
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
