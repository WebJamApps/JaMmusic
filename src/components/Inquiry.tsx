/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import superagent from 'superagent';
import { TextareaAutosize, Button } from '@mui/material';
import forms from '../lib/forms';
import stateData from '../lib/StateData.json';
import countryData from '../lib/CountryData.json';

export interface InquiryState {
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

export const isFormValid = (state: InquiryState) => {
  const { formError } = state;
  return formError !== '';
};

export const CommentsSection = (
  props: { currentState: InquiryState; comments: string; setState: (args0: InquiryState) => void; validateForm: () => void; },
) => {
  const { comments, setState, validateForm, currentState } = props;
  return (
    <TextareaAutosize
      style={{ marginTop: '20px', height: '80px', width: '100%' }}
      placeholder="Comments"
      className="comments"
      value={comments}
      onChange={(evt) => { setState({ ...currentState, comments: evt.target.value }); validateForm(); }}
    />
  );
};

export const FormActions = (
  props: { currentState:InquiryState; createEmail: (arg0: any) => void; },
) => {
  const { createEmail, currentState } = props;
  return (
    <div className="inquiryValidation input-field col" style={{ marginBottom: '12px' }}>
      <span className="inquiryValidation">* Required</span>
      <Button
        id="sendEmailButton"
        disabled={isFormValid(currentState)}
        onClick={(evt) => createEmail(evt)}
      >
        Send
      </Button>
    </div>
  );
};

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
      uSAstate: '* Select Your State',
      country: '* Select Your Country',
      zipcode: '',
      phonenumber: '',
      emailaddress: '',
      lastname: '',
      firstname: '',
      formError: ' ',
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

  handleCountryChange(event: React.ChangeEvent<HTMLSelectElement>): void { return this.setState({ country: event.target.value }); }

  onChange(evt: React.ChangeEvent<HTMLSelectElement>, isSelected?: boolean): void {
    if (isSelected) {
      this.setState({ uSAstate: evt.target.value });
    } else { this.setFormField(evt.target.id, evt.target.value); }
    this.validateForm();
  }

  onInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    this.setFormField(evt.target.id, evt.target.value);
    this.validateForm();
  }

  setFormField(id: string, value: string): void { return this.setState((preS) => ({ ...preS, [id]: value.trim() })); }

  continueValidating(validEmail: boolean): boolean {
    const {
      country, uSAstate, firstname, lastname, zipcode, comments,
    } = this.state;
    let validState = false, notEmpty = false;
    if (country === 'United States' && uSAstate !== '* Select Your State') validState = true;
    if (country !== 'United States') validState = true;
    if (firstname !== '' && lastname !== '' && zipcode !== '' && comments !== '') notEmpty = true;
    if (notEmpty && validEmail && country !== '* Select Your Country' && validState) {
      this.setState({ formError: '' });
      return false;
    }
    this.setState({ formError: 'Complete all required fields' });
    return true;
  }

  validateForm(): boolean {
    const {
      emailaddress,
    } = this.state;
    let validEmail = false;
    // eslint-disable-next-line no-useless-escape
    const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
    if (regEx.test(emailaddress) && emailaddress.includes('.')) {
      validEmail = true;
    } else {
      if (emailaddress !== '') this.setState({ formError: 'Invalid email format' });
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

  createEmail(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<number> {
    evt.preventDefault();
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
      <table style={{
        border: 'none', textAlign: 'left', margin: 0, padding: 0, marginBottom: '20px',
      }}
      >
        <tbody>
          <tr className="white-background">
            <td style={{ border: 'none', padding: 0 }}>{this.forms.makeInput('text', 'First Name', true, this.onInputChange, firstname)}</td>
            <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
            <td style={{ border: 'none', padding: 0 }}>{this.forms.makeInput('text', 'Last Name', true, this.onInputChange, lastname)}</td>
          </tr>
          <tr className="white-background"><td style={{ border: 'none', padding: '8px' }}>{' '}</td></tr>
          <tr className="white-background">
            <td style={{ border: 'none', padding: 0 }}>
              {this.forms.makeInput('email', 'Email Address', true, this.onInputChange, emailaddress)}
            </td>
            <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
            <td className="phone" style={{ border: 'none', padding: 0 }}>
              {' '}
              {this.forms.makeInput('tel', 'Phone Number', false, this.onInputChange, phonenumber)}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  newContactForm(): JSX.Element {
    const {
      country, formError, uSAstate, zipcode, comments,
    } = this.state;
    return (
      <form id="new-contact" className="col">
        {this.tableSection()}
        {this.forms.makeDropdown('country', country, this.handleCountryChange, this.countryValues, { width: '100%' })}
        {country === 'United States'
          ? this.forms.makeDropdown('state', uSAstate, this.onChange, this.stateValues)
          : null}
        <p style={{ margin: 0 }}>&nbsp;</p>
        {this.forms.makeInput('text', 'Zipcode', true, this.onInputChange, zipcode, { width: '100%' })}
        <p style={{ margin: 0 }}>&nbsp;</p>
        <CommentsSection currentState={this.state} comments={comments} setState={this.setState} validateForm={this.validateForm} />
        <p className="form-errors" style={{ color: 'red', marginBottom: '-15px' }}>{formError}</p>
        <FormActions currentState={this.state} createEmail={this.createEmail} />
      </form>
    );
  }

  render(): JSX.Element {
    const { submitted } = this.state;
    return (
      <div className="row form-row" style={{ margin: 'auto', border: '1px solid black' }}>
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
