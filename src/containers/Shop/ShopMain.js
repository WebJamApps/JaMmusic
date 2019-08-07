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
        <h3>Hello from ShopMain</h3>
        <div className="main">
          <p>
            Welcome to the landing page of the future Web Jam Shop.
           Ths application is currently a work in progress, so please check back later for more updates.
          </p>
          <p>
            In time, companies will be able to sign up to the shop as a means of selling products.
            We are planning on having a custom inventory space for each shop, all linked into a centralized area for customers to buy from.
            The shop items themselves will update in real time, so you don&apos;t try to buy an item that&apos;s not actually there.
          </p>
          <p>
            Updates are planned for the near future, so be sure to check back with us!
          </p>
          <p>
            If you would like to pre-register to sell or buy things in the future,
            you can sign up with an account using the login button to the right.
            Please note you&apos;ll need a google account to do so.
          </p>
        </div>
        <div style={{ minHeight: '3.2in' }}>&nbsp;</div>
      </div>
    );
  }
}
