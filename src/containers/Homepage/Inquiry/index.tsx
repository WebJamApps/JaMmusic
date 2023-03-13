// import { Component } from 'react';
// import superagent from 'superagent';
import {
  // TextareaAutosize,
  Button,
} from '@mui/material';
import { useState } from 'react';
// import { WjInput } from 'src/components/WjInput';
// import { WjDropdown } from 'src/components/WjDropdown';
// import stateData from './StateData.json';
// import countryData from './CountryData.json';
import utils from './utils';

export interface IinquiryFormData {
  firstname: string; lastname: string; emailaddress: string; uSAstate: string; country: string;
  phonenumber: string; zipcode: string; comments: string;
}

// export interface InquiryState {
//   country: string;
//   uSAstate: string;
//   firstname: string;
//   lastname: string;
//   zipcode: string;
//   comments: string;
//   emailaddress: string;
//   formError: string;
//   phonenumber: string;
//   submitted: boolean;
//   [x: number]: number;
// }

// export const isFormValid = (state: InquiryState) => {
//   const { formError } = state;
//   return formError !== '';
// };

// export function CommentsSection(
//   props: { currentState: InquiryState; comments: string; setState: (args0: InquiryState) => void; validateForm: () => void; },
// ) {
//   const {
//     comments, setState, validateForm, currentState,
//   } = props;
//   return (
//     <TextareaAutosize
//       style={{ marginTop: '20px', height: '80px', width: '100%' }}
//       placeholder="Comments"
//       className="comments"
//       value={comments}
//       onChange={(evt) => { setState({ ...currentState, comments: evt.target.value }); validateForm(); }}
//     />
//   );
// }

interface IformActionsProps {
  setHasSubmitted: (arg0: boolean) => void,
  formData:IinquiryFormData,
}
export function FormActions(props: IformActionsProps) {
  const { setHasSubmitted, formData } = props;
  // const { createEmail, currentState } = props;
  return (
    <div className="inquiryValidation input-field col" style={{ marginBottom: '12px' }}>
      <span className="inquiryValidation">* Required</span>
      <Button
        id="sendEmailButton"
        // disabled={isFormValid(currentState)}
        onClick={(evt) => {
          utils.handleSubmit(evt, formData, setHasSubmitted);
        }}
      >
        Submit
      </Button>
    </div>
  );
}

// onChange(evt: React.ChangeEvent<HTMLSelectElement>, isSelected?: boolean): void {
//   if (isSelected) {
//     this.setState({ uSAstate: evt.target.value });
//   } else { this.setFormField(evt.target.id, evt.target.value); }
//   this.validateForm();
// }

// onInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
//   this.setFormField(evt.target.id, evt.target.value);
//   this.validateForm();
// }

// setFormField(id: string, value: string): void { return this.setState((preS) => ({ ...preS, [id]: value.trim() })); }

// continueValidating(validEmail: boolean): boolean {
//   const {
//     country, uSAstate, firstname, lastname, zipcode, comments,
//   } = this.state;
//   let validState = false, notEmpty = false;
//   if (country === 'United States' && uSAstate !== '* Select Your State') validState = true;
//   if (country !== 'United States') validState = true;
//   if (firstname !== '' && lastname !== '' && zipcode !== '' && comments !== '') notEmpty = true;
//   if (notEmpty && validEmail && country !== '* Select Your Country' && validState) {
//     this.setState({ formError: '' });
//     return false;
//   }
//   this.setState({ formError: 'Complete all required fields' });
//   return true;
// }

// validateForm(): boolean {
//   const {
//     emailaddress,
//   } = this.state;
//   let validEmail = false;
//   // eslint-disable-next-line no-useless-escape, prefer-regex-literals
//   const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
//   if (regEx.test(emailaddress) && emailaddress.includes('.')) {
//     validEmail = true;
//   } else {
//     if (emailaddress !== '') this.setState({ formError: 'Invalid email format' });
//     return true;
//   }
//   return this.continueValidating(validEmail);
// }

// interface ItableSectionProps {
//   firstname:string, lastname:string,
//   emailaddress:string,
//   phonenumber:string,
// }
// function TableSection(props:ItableSectionProps): JSX.Element {
//   const {
//     firstname, lastname,
//     emailaddress,
//     phonenumber,
//   } = props;
//   return (
//     <table style={{
//       border: 'none', textAlign: 'left', margin: 0, padding: 0, marginBottom: '20px',
//     }}
//     >
//       <tbody>
//         <tr className="white-background">
//           <td style={{ border: 'none', padding: 0 }}>
//             <WjInput label="First Name" isRequired type="text" onChange={this.onInputChange} value={firstname} />
//           </td>
//           <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
//           <td style={{ border: 'none', padding: 0 }}>
//             <WjInput label="Last Name" isRequired type="text" onChange={this.onInputChange} value={lastname} />
//           </td>
//         </tr>
//         <tr className="white-background"><td style={{ border: 'none', padding: '8px' }}>{' '}</td></tr>
//         <tr className="white-background">
//           <td style={{ border: 'none', padding: 0 }}>
//             <WjInput label="Email Address" isRequired type="email" onChange={this.onInputChange} value={emailaddress} />
//           </td>
//           <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
//           <td className="phone" style={{ border: 'none', padding: 0 }}>
//             {' '}
//             <WjInput label="Phone Number" isRequired type="tel" onChange={this.onInputChange} value={phonenumber} />
//           </td>
//         </tr>
//       </tbody>
//     </table>
//   );
// }
interface IinquiryFormProps {
  setHasSubmitted: (arg0: boolean) => void,
  setFormData: (arg0: IinquiryFormData) => void,
  formData: IinquiryFormData,
}
function InquiryForm(props: IinquiryFormProps): JSX.Element {
  const {
    formData,
    // setFormData,
    setHasSubmitted,
  } = props;
  // const {
  //   country,
  //   uSAstate,
  //   zipcode,
  //   comments, firstname, lastname, emailaddress, phonenumber,
  // } = formData;
  return (
    <form id="new-contact" className="col">
      {/* <TableSection
        firstname={firstname}
        lastname={lastname}
        emailaddress={emailaddress}
        phonenumber={phonenumber}
      /> */}
      {/* <WjDropdown
        style={{ width: '100%' }}
        htmlFor="country"
        onChange={(evt) => utils.handleCountryChange(evt, formData, setFormData)}
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
      <CommentsSection
        currentState={this.state}
        comments={comments}
        setState={this.setState}
        validateForm={this.validateForm}
      />
      <p className="form-errors" style={{ color: 'red', marginBottom: '-15px' }}>
        {formError}
      </p>
      */}
      <FormActions setHasSubmitted={setHasSubmitted} formData={formData} />
    </form>
  );
}

export function Inquiry(): JSX.Element {
  // const { submitted } = this.state;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({} as IinquiryFormData);
  return (
    <div className="row form-row" style={{ margin: 'auto', border: '1px solid black' }}>
      {!hasSubmitted ? (
        <div className="contact-form">
          <h4 style={{
            textAlign: 'center', marginBottom: '0', marginTop: '10px', paddingTop: 0, fontWeight: 'bold',
          }}
          >
            Contact Us
          </h4>
          <InquiryForm setHasSubmitted={setHasSubmitted} formData={formData} setFormData={setFormData} />
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
// }
