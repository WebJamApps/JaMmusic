import React, { Component } from 'react';
import forms from '../lib/forms';
import stateData from '../lib/StateData.json';
import countryData from '../lib/CountryData.json';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false, comments: '', uSAstate: '', country: 'Afghanistan', zipcode: '', phonenumber: '', emailaddress: '', fullname: '',
    };
    this.stateValues = stateData;
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    // this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues.sort();
    this.countryValues = countryData;
    this.countryValues.sort();
  }

  onChange(evt, isSelect) {
    evt.preventDefault();
    if (isSelect) return this.setState({ uSAstate: evt.target.value });
    return this.setState({ [evt.target.id]: evt.target.value });
  }

  handleChange(event, isSelect) {
    if (isSelect) return this.setState({ country: event.target.value });
    return this.setState({ comments: event.target.value });
  }

  validateForm() {
    const {
      fullname, emailaddress, comments, zipcode,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    // const phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (regEx.test(emailaddress) && emailaddress.includes('.')) {
      validEmail = true;
    }
    // if (phoneno.test(phonenumber)) {
    //   validPhoneNumber = true;
    // }
    // if (phonenumber !== '' && !validPhoneNumber) return true;
    if (fullname && emailaddress && zipcode && comments !== '' && validEmail) return false;
    return true;
  }

  createEmailApi(emailForm1) {
    // eslint-disable-next-line no-unused-vars
    const emailForm = emailForm1;
    this.setState({ submitted: true });
    return true;
  }

  createEmail() {
    const {
      fullname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
    } = this.state;
    const emailForm = {
      fullname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
    };
    return this.createEmailApi(emailForm);
  }

  countryDropdown(country) {
    return (
      <label htmlFor="country">
          * Country
        <br />
        <select value={country} onChange={(event) => this.handleChange(event, true)}>
          {
            this.countryValues.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
          }
        </select>
      </label>
    );
  }

  statesDropdown(uSAstate) {
    return (
      <label htmlFor="state">
          State
        <br />
        <select value={uSAstate} onChange={(evt) => this.onChange(evt, true)}>
          {
            this.stateValues.map((sv) => <option id={sv} key={sv} value={sv}>{sv}</option>)
          }
        </select>
      </label>
    );
  }

  newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle) {
    const { country } = this.state;
    return (
      <form id="new-contact" style={{ marginTop: '4px', paddingLeft: '10px' }}>
        {this.forms.makeInput('text', 'Full Name', true, this.onChange, fullname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onChange, emailaddress)}
        { this.forms.makeInput('zip', 'Zipcode', true, this.onChange, zipcode)}
        { this.forms.makeInput('tel', 'Phone Number', false, this.onChange, phonenumber)}
        { this.countryDropdown() }
        { country === 'United States'
          ? (
            this.statesDropdown()
          )
          : null}
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
      submitted, fullname, emailaddress, comments, phonenumber, zipcode, buttonStyle,
    } = this.state;
    return (
      <div>
        { submitted === false ? (
          <div className="page-content">
            <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Contact Us</h3>
            {this.newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle)}
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
