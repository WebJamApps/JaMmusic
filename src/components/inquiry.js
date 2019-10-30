import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
      comments: '',
      states: '',
      email: '',
      customername: '',
    };
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
    this.states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    this.states.sort();
  }

  // componentDidMount() { document.title = 'Contact Us | Web Jam LLC'; }

  onChange(evt) {
    evt.preventDefault();
    this.setState({ [evt.target.id]: evt.target.value, states: evt.target.value });
  }

  handleChange(event) {
    this.setState({ comments: event.target.value });
  }

  validateForm() {
    const {
      customername, email, states, comments,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    if (regEx.test(email) && email.includes('.')) {
      validEmail = true;
    }
    if (customername && email && states && comments !== '' && validEmail) return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ redirect: true });
  }

  createEmail() {
    const {
      customername, email, states, comments,
    } = this.state;
    const emailForm = {
      customername, email, states, comments,
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

  newContactForm(customername, email, states, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.makeInput('text', 'customername', true, this.onChange, customername)}
        {this.makeInput('email', 'email', true, this.onChange, email)}
        <label htmlFor="state">
          * State
          <br />
          <select value={states} onChange={this.onChange}>
            {
              this.states.map((state) => <option id={states} key={state} value={state}>{state}</option>)
            }
          </select>
        </label>
        <label htmlFor="comments">
          * Comments
          <br />
          <textarea style={{ minWidth: '3in', paddingLeft: '5px' }} value={comments} onChange={this.handleChange} />
        </label>
        <div style={{ textAlign: 'right', marginTop: '10px', maxWidth: '85%' }}>
          <span style={{ fontSize: '16px', marginRight: '38%', fontFamily: 'Habibi' }}><i>* Required</i></span>
          <button style={buttonStyle} disabled={this.validateForm()} type="button" onClick={this.createEmail}>Send</button>
        </div>
      </form>
    );
  }

  render() {
    const {
      redirect, customername, email, states, comments, buttonStyle,
    } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
        {this.newContactForm(customername, email, states, comments, buttonStyle)}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}

