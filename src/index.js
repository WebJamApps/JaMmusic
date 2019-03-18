
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppIndex from './pages/app';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div id="App" className="App">
        <Router>
          <div id="homepage">
            <Switch>
              <Route exact path="/" component={ AppIndex }/>
              {/*<Route path="/home" component={ Home }/>*/}
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}
