import React, { Component } from 'react';
import superagent from 'superagent';
import { Textarea, Button } from 'react-materialize';
import forms from '../lib/forms';
import stateData from '../lib/StateData.json';
import countryData from '../lib/CountryData.json';

interface InquiryState {
  country: string;
  uSAstate: string;
  firstname: string;
  lastname: string;
  zipcode: string;
  comments: string;
  emailaddress: string;
  formError: string;
  phonenumber: string;
  submitted: boolean;
  [x: number]: number;
}

export default class Inquiry extends Component<unknown, InquiryState> {
  stateValues: string[];

  forms: typeof forms;

  countryValues: string[];

  superagent: superagent.SuperAgentStatic;

  constructor(props: unknown) {
    super(props);
    this.state = {
      submitted: false,
      comments: '',
      uSAstate: '* Select your State',
      country: '* Select your Country',
      zipcode: '',
      phonenumber: '',
      emailaddress: '',
      lastname: '',
      firstname: '',
      formError: '',
    };
    this.stateValues = stateData;
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.continueValidating = this.continueValidating.bind(this);
    this.createEmailApi = this.createEmailApi.bind(this);
    this.setFormField = this.setFormField.bind(this);
    this.stateValues.sort();
    this.countryValues = countryData;
    this.countryValues.sort();
    this.superagent = superagent;
  }

  onChange(evt: React.ChangeEvent<HTMLSelectElement>, isSelected?: boolean): void {
    if (isSelected) {
      return this.setState({ uSAstate: evt.target.value });
    }
    return this.setFormField(evt.target.id, evt.target.value);
  }

  onInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    return this.setFormField(evt.target.id, evt.target.value);
  }

  setFormField(id: string, value: string): void { return this.setState((preS) => ({ ...preS, [id]: value.trim() })); }

  handleCountryChange(event: React.ChangeEvent<HTMLSelectElement>): void { return this.setState({ country: event.target.value }); }

  continueValidating(validEmail: boolean): boolean {
    const {
      country, uSAstate, firstname, lastname, zipcode, comments, formError,
    } = this.state;
    let validState = false, notEmpty = false;
    if (country === 'United States' && uSAstate !== '* Select your State') validState = true;
    if (country !== 'United States') validState = true;
    if (firstname !== '' && lastname !== '' && zipcode !== '' && comments !== '') notEmpty = true;
    if (notEmpty && validEmail && country !== '* Select your Country' && validState) {
      if (formError !== '') this.setState({ formError: '' });
      return false;
    }
    if (formError === '' || formError === 'Ten-digit phone number') this.setState({ formError: 'Complete missing form fields' });
    return true;
  }

  validateForm(): boolean {
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
      if (formError === '' && emailaddress !== '') this.setState({ formError: 'Invalid email format' });
      return true;
    }
    if (phonenumber !== '' && !phoneno.test(phonenumber)) {
      if (formError !== 'Ten-digit phone number') this.setState({ formError: 'Ten-digit phone number' });
      return true;
    }
    return this.continueValidating(validEmail);
  }

  async createEmailApi(emailForm1: {
    firstname: string; lastname: string; emailaddress: string; uSAstate: string; country: string;
    phonenumber: string; zipcode: string; comments: string;
  }): Promise<number> {
    let r: superagent.Response;
    const emailForm = emailForm1;
    try {
      r = await this.superagent.post(`${process.env.BackendUrl}/inquiry`)
        .set('Content-Type', 'application/json')
        .send(emailForm);
    } catch (e) { return Promise.reject(e); }
    this.setState({ submitted: true });
    return r.status;
  }

  createEmail(): Promise<number> {
    const {
      firstname, lastname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
    } = this.state;
    const emailForm = {
      firstname, lastname, emailaddress, uSAstate, country, phonenumber, zipcode, comments: comments.trim(),
    };
    return this.createEmailApi(emailForm);
  }

  tableSection(): JSX.Element {
    const {
      firstname, lastname, emailaddress, phonenumber,
    } = this.state;
    return (
      <div>
        {this.forms.makeInput('text', 'First Name', true, this.onInputChange, firstname)}
        {this.forms.makeInput('text', 'Last Name', true, this.onInputChange, lastname)}
        {this.forms.makeInput('email', 'Email Address', true, this.onInputChange, emailaddress)}
        {this.forms.makeInput('tel', 'Phone Number', false, this.onInputChange, phonenumber)}
      </div>
    );
  }

  commentsSection(comments: string): JSX.Element {
    return (
      <Textarea
        label="* Comments"
        value={comments}
        onChange={(evt) => this.setState({ comments: evt.target.value.trim() })}
      />
    );
  }

  newContactForm(): JSX.Element {
    const {
      country, formError, uSAstate, zipcode, comments,
    } = this.state;
    return (
      <form id="new-contact" className="col s12">
        {this.tableSection()}
        {this.forms.makeDropdown('country', country, this.handleCountryChange, this.countryValues)}
        {country === 'United States'
          ? this.forms.makeDropdown('state', uSAstate, this.onChange, this.stateValues)
          : null}
        {this.forms.makeInput('zip', 'Zipcode', true, this.onInputChange, zipcode)}
        {this.commentsSection(comments)}
        <p className="form-errors" style={{ color: 'red' }}>{formError}</p>
        <div className="inquiryValidation input-field col" style={{ marginBottom: '12px' }}>
          <span className="inquiryValidation">* Required</span>
          <Button
            flat
            node="button"
            waves="light"
            disabled={this.validateForm()}
            onClick={this.createEmail}
          >
            Send
          </Button>
        </div>
      </form>
    );
  }

  render(): JSX.Element {
    const { submitted } = this.state;
    return (
      <div className="row" style={{ maxWidth: '340px', margin: 'auto', border: '1px solid black' }}>
        {submitted === false ? (
          <div className="contact-form">
            <h4 style={{
              textAlign: 'center', marginBottom: '0', marginTop: '10px', paddingTop: 0, fontWeight: 'bold',
            }}
            >
              Contact Us
            </h4>
            {this.newContactForm()}
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
