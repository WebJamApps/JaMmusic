import React, { Component } from 'react';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class ShopMain extends Component {
  constructor(props) {
    super(props);
    this.children = props.children;// eslint-disable-line react/prop-types
  }

  componentDidMount() {
    document.title = 'Shop | Web Jam LLC';
  }

  render() {
    return (
      <div className="page-content">
        <h3 style={{ textAlign: 'center', margin: '20px', fontWeight: 'bold' }}>Web Jam Shop</h3>
        <div
          className="main"
          style={{
            paddingLeft: '20px', paddingRight: '20px', maxWidth: '9in', margin: 'auto',
          }}
        >
          <p style={{ fontSize: '40pt' }}>
            {' '}
          </p>
          <p style={{ fontSize: '14pt' }}>
            Welcome to the landing page of the future Web Jam Shop.
            This application is currently a work in progress, so please check back later for more updates.
            In time, businesses will be able to sign up to the shop as a means of selling products.
          </p>
          <p style={{ fontSize: '14pt' }}>
We are planning on having a custom inventory space for each business, all linked into a centralized area for customers to buy from.
            The shop items themselves will update in real time, to prevent the purchase of items that are out of stock.
          </p>
        </div>
        <div style={{ minHeight: '4.7in' }}>&nbsp;</div>
      </div>
    );
  }
}
