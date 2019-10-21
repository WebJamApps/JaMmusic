import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      name: '',
      email: '',
      location: '',
      comments: '',
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
      name, email, location, comments,
    } = this.state;
    if (name && email && location && comments !== '') return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ redirect: true });
  }

  createEmail() {
    const {
      name, email, location, comments,
    } = this.state;
    const emailForm = {
      name, email, location, comments,
    };
    return this.createEmailApi(emailForm);
  }

  // eslint-disable-next-line class-methods-use-this
  makeInput(type, name, isRequired, onChange, value) {
    return (
      <label htmlFor={name} style={{ marginTop: '14px', paddingTop: 0 }}>
        {isRequired ? '* ' : ''}
        {name[0].toUpperCase() + name.slice(1)}
        <br />
        <input id={name} type={type} name={name} onChange={onChange} required={isRequired} value={value} />
      </label>
    );
  }

  newContactForm(name, email, location, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.makeInput('text', 'name', true, this.onChange, name)}
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
      redirect, name, email, location, comments, buttonStyle,
    } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
        {this.newContactForm(name, email, location, comments, buttonStyle)}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}

