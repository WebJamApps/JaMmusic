import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      comments: '',
      uSAstate: 'Alabama',
      email: '',
      customername: '',
    };
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    this.stateValues.sort();
  }

  componentDidUpdate() {
    console.log(this.state);
  }

  onChange(evt, isSelect) {
    evt.preventDefault();
    console.log(evt);
    if (isSelect) return this.setState({ uSAstate: evt.target.value });
    return this.setState({ [evt.target.id]: evt.target.value });
  }

  handleChange(event) {
    this.setState({ comments: event.target.value });
  }

  validateForm() {
    const {
      customername, email, comments,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    if (regEx.test(email) && email.includes('.')) {
      validEmail = true;
    }
    if (customername && email && comments !== '' && validEmail) return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ redirect: true });
  }

  createEmail() {
    const {
      customername, email, uSAstate, comments,
    } = this.state;
    const emailForm = {
      customername, email, uSAstate, comments,
    };
    return this.createEmailApi(emailForm);
  }

  // eslint-disable-next-line class-methods-use-this
  makeInput(type, name, isRequired, onChange, value) {
    return (
      <label className="inquiryLabel" htmlFor={name}>
        {isRequired ? '* ' : ''}
        {name[0].toUpperCase() + name.slice(1)}
        <br />
        <input id={name} type={type} name={name} onChange={onChange} required={isRequired} value={value} />
      </label>
    );
  }

  statesDropdown(uSAstate) {
    return (
      <label htmlFor="state">
          * State
        <br />
        <select value={uSAstate} onChange={(evt) => this.onChange(evt, true)}>
          {
            this.stateValues.map((sv) => <option id={sv} key={sv} value={sv}>{sv}</option>)
          }
        </select>
      </label>
    );
  }

  newContactForm(customername, email, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.makeInput('text', 'customername', true, this.onChange, customername)}
        {this.makeInput('email', 'email', true, this.onChange, email)}
        { this.statesDropdown() }
        <label htmlFor="comments">
          * Comments
          <br />
          <textarea style={{ minWidth: '3in', paddingLeft: '5px' }} value={comments} onChange={this.handleChange} />
        </label>
        <div className="inquiryValidation">
          <span className="inquiryValidation">* Required</span>
          <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createEmail}>Send</button>
        </div>
      </form>
    );
  }

  render() {
    const {
      redirect, customername, email, comments, buttonStyle,
    } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
        {this.newContactForm(customername, email, comments, buttonStyle)}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
