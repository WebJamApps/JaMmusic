import { Component } from 'react';
import superagent from 'superagent';
import { TextareaAutosize, Button } from '@mui/material';
import { WjInput } from 'src/components/WjInput';
import { WjDropdown } from 'src/components/WjDropdown';
import stateData from './StateData.json';
import countryData from './CountryData.json';

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

export function CommentsSection(
  props: { currentState: InquiryState; comments: string; setState: (args0: InquiryState) => void; validateForm: () => void; },
) {
  const {
    comments, setState, validateForm, currentState,
  } = props;
  return (
    <TextareaAutosize
      style={{ marginTop: '20px', height: '80px', width: '100%' }}
      placeholder="Comments"
      className="comments"
      value={comments}
      onChange={(evt) => { setState({ ...currentState, comments: evt.target.value }); validateForm(); }}
    />
  );
}

export function FormActions(props: { currentState: InquiryState; createEmail: (arg0: any) => void; }) {
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
}

export default class Inquiry extends Component<unknown, InquiryState> {
  stateValues: string[];

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
    // eslint-disable-next-line no-useless-escape, prefer-regex-literals
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
      firstname, lastname,
      emailaddress,
      phonenumber,
    } = this.state;
    return (
      <table style={{
        border: 'none', textAlign: 'left', margin: 0, padding: 0, marginBottom: '20px',
      }}
      >
        <tbody>
          <tr className="white-background">
            <td style={{ border: 'none', padding: 0 }}>
              <WjInput label="First Name" isRequired type="text" onChange={this.onInputChange} value={firstname} />
            </td>
            <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
            <td style={{ border: 'none', padding: 0 }}>
              <WjInput label="Last Name" isRequired type="text" onChange={this.onInputChange} value={lastname} />
            </td>
          </tr>
          <tr className="white-background"><td style={{ border: 'none', padding: '8px' }}>{' '}</td></tr>
          <tr className="white-background">
            <td style={{ border: 'none', padding: 0 }}>
              <WjInput label="Email Address" isRequired type="email" onChange={this.onInputChange} value={emailaddress} />
            </td>
            <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
            <td className="phone" style={{ border: 'none', padding: 0 }}>
              {' '}
              <WjInput label="Phone Number" isRequired type="tel" onChange={this.onInputChange} value={phonenumber} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  newContactForm(): JSX.Element {
    const {
      country,
      formError,
      uSAstate,
      zipcode,
      comments,
    } = this.state;
    return (
      <form id="new-contact" className="col">
        {this.tableSection()}
        <WjDropdown
          style={{ width: '100%' }}
          htmlFor="country"
          onChange={this.handleCountryChange}
          value={country}
          options={this.countryValues}
        />
        {country === 'United States'
          ? (
            <WjDropdown
              htmlFor="state"
              onChange={this.onChange}
              value={uSAstate}
              options={this.stateValues}
            />
          )
          : <> </>}
        <p style={{ margin: 0 }}>&nbsp;</p>
        <WjInput
          label="Zipcode"
          isRequired
          type="text"
          onChange={this.onInputChange}
          value={zipcode}
          style={{ width: '100%' }}
        />
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
