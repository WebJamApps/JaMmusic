
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppIndex from './pages/app';
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
              <Route exact path="/" component={ AppIndex }/>
              {/*<Route path="/home" component={ Home }/>*/}
            </Switch>
          </AppTemp>
        </Router>
      </div>
    );
  }
}
