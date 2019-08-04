/* eslint-disable react/prefer-stateless-function */
/* Remove after more is added to satisfy eslint */
import React, { Component } from 'react';

export default class HomePage extends Component {
  render() {
    return (
      <div className="page-content">
        <h3>Hello from Home</h3>
        <p>This is a temporary page while things get transitioned over.</p>
        <div style={{ minHeight: '4.4in' }}>&nbsp;</div>
      </div>
    );
  }
}
