import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      comments: '',
      location: '',
      email: '',
      customerName: '',
    };
    this.onChange = this.onChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
  }

  // componentDidMount() { document.title = 'Contact Us | Web Jam LLC'; }

  onChange(evt) {
    evt.preventDefault();
    this.setState({ [evt.target.id]: evt.target.value });
  }

  validateForm() {
    const {
      customerName, email, location, comments,
    } = this.state;
    if (customerName && email && location && comments !== '') return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ redirect: true });
  }

  createEmail() {
    const {
      customerName, email, location, comments,
    } = this.state;
    const emailForm = {
      customerName, email, location, comments,
    };
    return this.createEmailApi(emailForm);
  }

  // eslint-disable-next-line class-methods-use-this
  makeInput(type, customerName, isRequired, onChange, value) {
    return (
      <label htmlFor={customerName} style={{ marginTop: '14px', paddingTop: 0 }}>
        {isRequired ? '* ' : ''}
        {customerName[0].toUpperCase() + customerName.slice(1)}
        <br />
        <input id={customerName} type={type} customerName={customerName} onChange={onChange} required={isRequired} value={value} />
      </label>
    );
  }

  newContactForm(customerName, email, location, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.makeInput('text', 'name', true, this.onChange, customerName)}
        {this.makeInput('email', 'email', true, this.onChange, email)}
        {this.makeInput('text', 'location', true, this.onChange, location)}
        {this.makeInput('textarea', 'comments', true, this.onChange, comments)}
        <div style={{ textAlign: 'right', marginTop: '10px', maxWidth: '85%' }}>
          <span style={{ fontSize: '16px', marginRight: '38%', fontFamily: 'Habibi' }}><i>* Required</i></span>
          <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createEmail}>Send</button>
        </div>
      </form>
    );
  }

  render() {
    const {
      redirect, customerName, email, location, comments, buttonStyle,
    } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
        {this.newContactForm(customerName, email, location, comments, buttonStyle)}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}

