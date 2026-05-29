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
      onChange={(evt) => {
        const { target: { value } } = evt;
        setFormData({ ...formData, comments: evt.target.value });
        return value;
      }}
    />
  );
}

interface IformActionsProps {
  setHasSubmitted: (arg0: boolean) => void,
  setSubmitError: (arg0: boolean) => void,
  formData: IinquiryFormData,
}
export function FormActions(props: IformActionsProps) {
  const { setHasSubmitted, setSubmitError, formData } = props;
  return (
    <div className="inquiryValidation input-field col" style={{ marginBottom: '12px' }}>
      <span className="inquiryValidation">* Required</span>
      <Button
        className="submit-inquiry"
        variant="contained"
        id="sendEmailButton"
        disabled={utils.validateForm(formData)}
        onClick={(evt) => {
          utils.handleSubmit(evt, formData, setHasSubmitted, setSubmitError);
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
export function EmailPhoneRow(props: ItableSectionProps) {
  const { formData, setFormData } = props;
  const { emailaddress, phonenumber } = formData;
  return (
    <tr className="white-background">
      <td style={{ border: 'none', padding: 0 }}>
        <WjInput
          label="Email Address"
          isRequired
          type="email"
          value={emailaddress}
          onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
        />
      </td>
      <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
      <td className="phone" style={{ border: 'none', padding: 0 }}>
        {' '}
        <WjInput
          label="Phone Number"
          isRequired
          type="tel"
          value={phonenumber}
          onChange={(evt) => {
            const { target: { value } } = evt;
            utils.handleInputChange(evt, formData, setFormData);
            return value;
          }}

        />
      </td>
    </tr>
  );
}

export function TableSection(props: ItableSectionProps) {
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
              value={firstname}
              onChange={(evt) => utils.handleInputChange(evt, formData, setFormData)}
            />
          </td>
          <td style={{ border: 'none', padding: '8px' }}>{' '}</td>
          <td style={{ border: 'none', padding: 0 }}>
            <WjInput
              label="Last Name"
              isRequired
              type="text"
              value={lastname}
              onChange={(evt) => {
                const { target: { value } } = evt;
                utils.handleInputChange(evt, formData, setFormData);
                return value;
              }}
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
  setSubmitError: (arg0: boolean) => void,
  setFormData: (arg0: IinquiryFormData) => void,
  formData: IinquiryFormData,
  staticCountry?: string
}
export function InquiryForm(props: IinquiryFormProps) {
  // eslint-disable-next-line object-curly-newline
  const { formData, setFormData, setHasSubmitted, setSubmitError, staticCountry } = props;
  const { country, uSAstate, zipcode } = formData;
  return (
    <form id="new-contact" className="col">
      <TableSection formData={formData} setFormData={setFormData} />
      <WjDropdown
        disabled={!!staticCountry}
        style={{ width: '100%' }}
        htmlFor="country"
        value={staticCountry || country}
        onChange={(evt) => {
          const { target: { value } } = evt;
          utils.handleCountryChange(evt, formData, setFormData);
          return value;
        }}
        options={countryData.sort()}
      />
      {country === 'United States' || staticCountry === 'United States'
        ? (
          <WjDropdown
            htmlFor="state"
            value={uSAstate}
            onChange={(evt) => {
              const { target: { value } } = evt;
              utils.handleUsStateChange(evt, formData, setFormData);
              return value;
            }}
            options={stateData.sort()}
          />
        )
        : <> </>}
      <p style={{ margin: 0 }}>&nbsp;</p>
      <WjInput
        label="Zipcode"
        isRequired
        type="text"
        value={zipcode}
        onChange={(evt) => {
          const { target: { value } } = evt;
          utils.handleInputChange(evt, formData, setFormData);
          return value;
        }}
        style={{ width: '100%' }}
      />
      <p style={{ margin: 0 }}>&nbsp;</p>
      <CommentsSection formData={formData} setFormData={setFormData} />
      <FormActions setHasSubmitted={setHasSubmitted} setSubmitError={setSubmitError} formData={formData} />
    </form>
  );
}

export const InquiryError = () => (
  <p
    className="inquiryError"
    role="alert"
    style={{
      color: '#b00020', textAlign: 'center', margin: '14px', paddingBottom: '4px', fontWeight: 'bold',
    }}
  >
    Sorry &mdash; we couldn&rsquo;t deliver your inquiry. Please try again, or email
    {' '}
    <a href="mailto:joshua.v.sherman@gmail.com">joshua.v.sherman@gmail.com</a>
    {' '}
    directly.
  </p>
);

export const ContactRequest = () => (
  <div className="page-content contacted">
    <p style={{ textAlign: 'center', margin: '14px', paddingBottom: '15px' }}>
      Thank you for contacting us.
      <br />
      We will respond to your request soon.
    </p>
  </div>
);
interface IcontactFormProps {
  hasSubmitted: boolean,
  submitError: boolean,
  hideTitle?: boolean,
  country?: string,
  setHasSubmitted: (arg0: boolean) => void
  setSubmitError: (arg0: boolean) => void
  formData: IinquiryFormData,
  setFormData: (arg0: IinquiryFormData) => void
}

export function ContactForm(props: IcontactFormProps) {
  const {
    hasSubmitted, submitError, hideTitle, country, setHasSubmitted, setSubmitError, formData, setFormData,
  } = props;
  return (
    <div
      className="contact-us"
      style={{
        margin: 'auto',
      }}
    >
      {!hasSubmitted ? (
        <div className="contact-form">
          <h4 style={{
            textAlign: 'center', marginBottom: '0', marginTop: '1px', paddingTop: 0, fontWeight: 'bold',
          }}
          >
            {hideTitle ? '' : 'Contact Us'}
          </h4>
          {submitError ? <InquiryError /> : null}
          <InquiryForm
            staticCountry={country}
            setHasSubmitted={setHasSubmitted}
            setSubmitError={setSubmitError}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      ) : (
        <ContactRequest />
      )}
    </div>
  );
}
export function Inquiry({ country, hideTitle }: { country?: string, hideTitle?: boolean }) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [formData, setFormData] = useState({} as IinquiryFormData);
  const props = {
    hasSubmitted, submitError, hideTitle, country, setHasSubmitted, setSubmitError, formData, setFormData,
  };
  return (
    <ContactForm {...props} />
  );
}

