import React, { Component } from 'react';
import superagent from 'superagent';
import forms from '../lib/forms';
import stateData from '../lib/StateData.json';
import countryData from '../lib/CountryData.json';

export default class Inquiry extends Component {
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
    this.continueValidating = this.continueValidating.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
    this.stateValues.sort();
    this.countryValues = countryData;
    this.countryValues.sort();
    this.superagent = superagent;
  }

  onChange(evt, isSelect) {
    if (isSelect) return this.setState({ uSAstate: evt.target.value });
    return this.setState({ [evt.target.id]: evt.target.value });
  }

  handleChange(event, isSelect) {
    if (isSelect) return this.setState({ country: event.target.value });
    return this.setState({ comments: event.target.value });
  }

  continueValidating(validEmail) {
    const {
      country, uSAstate, fullname, zipcode, comments, formError,
    } = this.state;
    let validState = false, notEmpty = false;
    if (country === 'United States' && uSAstate !== '--') validState = true;
    if (country !== 'United States') validState = true;
    if (fullname !== '' && zipcode !== '' && comments !== '') notEmpty = true;
    if (notEmpty && validEmail && country !== '--' && validState) {
      if (formError !== '') this.setState({ formError: '' });
      return false;
    }
    if (formError === '' || formError === 'Ten-digit phone number') this.setState({ formError: 'Complete missing form fields' });
    return true;
  }

  validateForm() {
    const {
      emailaddress, phonenumber, formError,
    } = this.state;
    let validEmail = false;
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
    if (phonenumber !== '' && !phoneno.test(phonenumber)) {
      if (formError !== 'Ten-digit phone number') this.setState({ formError: 'Ten-digit phone number' });
      return true;
    }
    return this.continueValidating(validEmail);
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

  newContactForm(fullname, emailaddress, phonenumber, zipcode, comments, buttonStyle) {
    const { country, formError, uSAstate } = this.state;
    return (
      <form id="new-contact" style={{ maxWidth: '316px', marginLeft: '10px' }}>
        {this.forms.makeInput('text', 'Full Name', true, this.onChange, fullname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onChange, emailaddress)}
        { this.forms.makeInput('tel', 'Phone Number (Digits Only)', false, this.onChange, phonenumber)}
        { this.forms.makeDropdown('country', '* Country', country, this.handleChange, this.countryValues) }
        { country === 'United States'
          ? this.forms.makeDropdown('state', '* State', uSAstate, this.onChange, this.stateValues)
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
