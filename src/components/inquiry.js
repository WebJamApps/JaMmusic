import React, { Component } from 'react';
import superagent from 'superagent';
import forms from '../lib/forms';
import stateData from '../lib/StateData.json';
import countryData from '../lib/CountryData.json';

export default class inquiry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false, comments: '', uSAstate: '--', country: '--', zipcode: '', phonenumber: '', emailaddress: '', fullname: '', formError: '',
    };
    this.stateValues = stateData;
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues.sort();
    this.countryValues = countryData;
    this.countryValues.sort();
    this.superagent = superagent;
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
      fullname, emailaddress, comments, zipcode, phonenumber, formError, country, uSAstate,
    } = this.state;
    let validEmail = false, validPhoneNumber = false, validState = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    const phoneno = /^\d{10}$/;
    if (regEx.test(emailaddress) && emailaddress.includes('.')) {
      validEmail = true;
      if (formError === 'Invalid email format') this.setState({ formError: '' });
    } else {
      if (formError === '') this.setState({ formError: 'Invalid email format' });
      return true;
    }
    if (phoneno.test(phonenumber)) validPhoneNumber = true;
    if (phonenumber !== '' && !validPhoneNumber) {
      if (formError !== 'Ten-digit phone number') this.setState({ formError: 'Ten-digit phone number' });
      return true;
    }
    if (country === 'United States' && uSAstate !== '--')validState = true;
    if (country !== 'United States')validState = true;
    if (fullname && emailaddress && zipcode && comments !== '' && validEmail && country !== '--' && validState) {
      if (formError !== '') this.setState({ formError: '' });
      return false;
    }
    if (formError === '' || formError === 'Ten-digit phone number') this.setState({ formError: 'Complete missing form fields' });
    return true;
  }

  async createEmailApi(emailForm1) {
    let r;
    const emailForm = emailForm1;
    try {
      r = await this.superagent.post(`${process.env.BackendUrl}/inquiry`)
        .set('Content-Type', 'application/json')
        .send(emailForm);
    } catch (e) { return Promise.reject(e); }
    this.setState({ submitted: true });
    return Promise.resolve(r.status);
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
      <label htmlFor="country" style={{ paddingTop: '12px' }}>
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
      <label htmlFor="state" style={{ paddingTop: '12px' }}>
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

  newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle) {
    const { country, formError } = this.state;
    return (
      <form id="new-contact" style={{ maxWidth: '316px', marginLeft: '10px' }}>
        {this.forms.makeInput('text', 'Full Name', true, this.onChange, fullname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onChange, emailaddress)}
        { this.forms.makeInput('tel', 'Phone Number (Digits Only)', false, this.onChange, phonenumber)}
        { this.countryDropdown() }
        { country === 'United States'
          ? (
            this.statesDropdown()
          )
          : null}
        { this.forms.makeInput('zip', 'Zipcode', true, this.onChange, zipcode)}
        <label htmlFor="comments">
          * Comments
          <br />
          <textarea style={{ minWidth: '3in', paddingLeft: '5px' }} value={comments} onChange={this.handleChange} />
        </label>
        <p className="form-errors" style={{ color: 'red' }}>{formError}</p>
        <div className="inquiryValidation" style={{ marginBottom: '12px' }}>
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
      <div style={{ maxWidth: '320px', margin: 'auto', border: '1px solid black' }}>
        { submitted === false ? (
          <div className="contact-form">
            <h4 style={{
              textAlign: 'center', marginBottom: '0', marginTop: '10px', paddingTop: 0, fontWeight: 'bold',
            }}
            >
              Contact Us
            </h4>
            {this.newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle)}
          </div>
        ) : (
          <div className="page-content contacted">
            <p style={{ textAlign: 'center', margin: '14px', paddingBottom: '15px' }}>
              Thank you for contacting us.
              <br />
              We will respond to your request soon.
            </p>
          </div>
        )}
      </div>
    );
  }
}
