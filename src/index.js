
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppIndex from './pages/app';
import AppBuyMusic from './pages/buymusic';
import AppFourOhFour from './pages/404';
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
              <Route exact path="/music" component={ AppIndex }/>
              <Route path="/music/buymusic" component={ AppBuyMusic }/>
              <Route component={ AppFourOhFour }/>
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
