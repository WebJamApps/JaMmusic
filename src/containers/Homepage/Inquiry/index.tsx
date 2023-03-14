import {
  TextareaAutosize,
  Button,
} from '@mui/material';
import { useState } from 'react';
import { WjInput } from 'src/components/WjInput';
import { WjDropdown } from 'src/components/WjDropdown';
import stateData from './StateData.json';
import countryData from './CountryData.json';
import utils from './utils';
import './inquiry.scss';

export interface IinquiryFormData {
  firstname: string; lastname: string; emailaddress: string; uSAstate: string; country: string;
  phonenumber: string; zipcode: string; comments: string;
}
interface IcommentsSectionProps {
  formData: IinquiryFormData, setFormData: (arg0: IinquiryFormData) => void
}
export function CommentsSection(props: IcommentsSectionProps) {
  const {
    formData, setFormData,
  } = props;
  const { comments } = formData;
  return (
    <TextareaAutosize
      style={{ marginTop: '20px', height: '80px', width: '100%' }}
      placeholder="* Comments"
      className="comments"
      value={comments}
      onChange={(evt) => setFormData({ ...formData, comments: evt.target.value })}
    />
  );
}

interface IformActionsProps {
  setHasSubmitted: (arg0: boolean) => void,
  formData: IinquiryFormData,
}
export function FormActions(props: IformActionsProps) {
  const { setHasSubmitted, formData } = props;
  return (
    <div className="inquiryValidation input-field col" style={{ marginBottom: '12px' }}>
      <span className="inquiryValidation">* Required</span>
      <Button
        variant="contained"
        id="sendEmailButton"
        disabled={utils.validateForm(formData)}
        onClick={(evt) => {
          utils.handleSubmit(evt, formData, setHasSubmitted);
        }}
      >
        Submit
      </Button>
    </div>
  );
}
interface ItableSectionProps {
  formData: IinquiryFormData, setFormData: (arg0: IinquiryFormData) => void
}
function EmailPhoneRow(props: ItableSectionProps) {
  const { formData, setFormData } = props;
  const { emailaddress, phonenumber } = formData;
  return (
    <tr className="white-background">
      <td style={{ border: 'none', padding: 0 }}>
        <WjInput
          label="Email Address"
          isRequired
          type="email"
          onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
          value={emailaddress}
        />
      </td>
      <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
      <td className="phone" style={{ border: 'none', padding: 0 }}>
        {' '}
        <WjInput
          label="Phone Number"
          isRequired
          type="tel"
          onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
          value={phonenumber}
        />
      </td>
    </tr>
  );
}

function TableSection(props: ItableSectionProps): JSX.Element {
  const { formData, setFormData } = props;
  const { firstname, lastname } = formData;
  return (
    <table className="tableSection">
      <tbody>
        <tr className="white-background">
          <td style={{ border: 'none', padding: 0 }}>
            <WjInput
              label="First Name"
              isRequired
              type="text"
              onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
              value={firstname}
            />
          </td>
          <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
          <td style={{ border: 'none', padding: 0 }}>
            <WjInput
              label="Last Name"
              isRequired
              type="text"
              onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
              value={lastname}
            />
          </td>
        </tr>
        <tr className="white-background"><td style={{ border: 'none', padding: '8px' }}>{' '}</td></tr>
        <EmailPhoneRow formData={formData} setFormData={setFormData} />
      </tbody>
    </table>
  );
}

interface IinquiryFormProps {
  setHasSubmitted: (arg0: boolean) => void,
  setFormData: (arg0: IinquiryFormData) => void,
  formData: IinquiryFormData,
}
function InquiryForm(props: IinquiryFormProps): JSX.Element {
  const {
    formData,
    setFormData,
    setHasSubmitted,
  } = props;
  const { country, uSAstate, zipcode } = formData;
  return (
    <form id="new-contact" className="col">
      <TableSection formData={formData} setFormData={setFormData} />
      <WjDropdown
        style={{ width: '100%' }}
        htmlFor="country"
        onChange={(evt) => utils.handleCountryChange(evt, formData, setFormData)}
        value={country}
        options={countryData.sort()}
      />
      {country === 'United States'
        ? (
          <WjDropdown
            htmlFor="state"
            onChange={(evt) => utils.handleUsStateChange(evt, formData, setFormData)}
            value={uSAstate}
            options={stateData.sort()}
          />
        )
        : <> </>}
      <p style={{ margin: 0 }}>&nbsp;</p>
      <WjInput
        label="Zipcode"
        isRequired
        type="text"
        onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
        value={zipcode}
        style={{ width: '100%' }}
      />
      <p style={{ margin: 0 }}>&nbsp;</p>
      <CommentsSection formData={formData} setFormData={setFormData} />
      <FormActions setHasSubmitted={setHasSubmitted} formData={formData} />
    </form>
  );
}

export function Inquiry(): JSX.Element {
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

