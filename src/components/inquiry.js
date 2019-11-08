import React, { Component } from 'react';
import forms from '../lib/forms';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      comments: '',
      uSAstate: 'Alabama',
      emailaddress: '',
      fullname: '',
    };
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    // this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    this.stateValues.sort();
  }

  onChange(evt, isSelect) {
    evt.preventDefault();
    if (isSelect) return this.setState({ uSAstate: evt.target.value });
    return this.setState({ [evt.target.id]: evt.target.value });
  }

  handleChange(event) {
    this.setState({ comments: event.target.value });
  }

  validateForm() {
    const {
      fullname, emailaddress, comments,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    if (regEx.test(emailaddress) && emailaddress.includes('.')) {
      validEmail = true;
    }
    if (fullname && emailaddress && comments !== '' && validEmail) return false;
    return true;
  }

  // createEmailApi(emailForm1) {
  //   // eslint-disable-next-line no-unused-vars
  //   const emailForm = emailForm1;
  //   this.setState({ submitted: true });
  // }

  createEmail() {
    const {
      fullname, emailaddress, uSAstate, comments,
    } = this.state;
    const emailForm = {
      fullname, emailaddress, uSAstate, comments,
    };
    console.log('ready to post to the backend');
    console.log(emailForm);
    // return this.createEmailApi(emailForm);
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

  newContactForm(fullname, emailaddress, comments, buttonStyle) {
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.forms.makeInput('text', 'Full Name', true, this.onChange, fullname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onChange, emailaddress)}
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
      submitted, fullname, emailaddress, comments, buttonStyle,
    } = this.state;
    return (
      <div>
        { submitted === false ? (
          <div className="page-content">
            <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
            {this.newContactForm(fullname, emailaddress, comments, buttonStyle)}
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
          </div>
        ) : (
          <div className="page-content contacted">
            <p style={{ textAlign: 'center', margin: '14px', paddingBottom: '15px' }}>
              Thank you for contacting us.
              <br />
              We will be in contact with you shortly.
            </p>
          </div>
        )}
      </div>
    );
  }
}
