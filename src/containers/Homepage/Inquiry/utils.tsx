import type { IinquiryFormData } from '.';

function handleCountryChange(
  event: React.ChangeEvent<HTMLSelectElement>,
  formData: IinquiryFormData,
  setFormData: (arg0: IinquiryFormData) => void,
): void {
  setFormData({ ...formData, country: event.target.value });
}

async function createEmailApi(
  emailForm: IinquiryFormData,
  setHasSubmitted: (arg0: boolean) => void,
  setSubmitError: (arg0: boolean) => void,
): Promise<void> {
  try {
    const res = await fetch(`${process.env.BackendUrl}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailForm),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setHasSubmitted(true);
  } catch (e) {
    console.log((e as Error).message);
    setSubmitError(true);
  }
}

async function handleSubmit(
  evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  formData: IinquiryFormData,
  setHasSubmitted: (arg0: boolean) => void,
  setSubmitError: (arg0: boolean) => void,
): Promise<void> {
  const {
    firstname, lastname, emailaddress, uSAstate, country, phonenumber, zipcode, comments,
  } = formData;
  const emailForm = {
    firstname,
    lastname,
    emailaddress,
    uSAstate,
    country,
    phonenumber,
    zipcode,
    comments: (comments).trim(),
  };
  await createEmailApi(emailForm, setHasSubmitted, setSubmitError);
}

function handleInputChange(
  evt: React.ChangeEvent<HTMLInputElement>,
  formData: IinquiryFormData,
  setFormData: (arg0: IinquiryFormData) => void,
): string {
  const { id, value } = evt.target;
  setFormData({ ...formData, [id]: value });
  return value;
}

function handleUsStateChange(
  evt: React.ChangeEvent<HTMLSelectElement>,
  formData: IinquiryFormData,
  setFormData: (arg0: IinquiryFormData) => void,
): void {
  setFormData({ ...formData, uSAstate: evt.target.value });
}

function continueValidating(formData: IinquiryFormData): boolean {
  const {
    country, uSAstate, firstname, lastname, zipcode, comments,
  } = formData;
  let validState = false, notEmpty = false;
  if (country === 'United States' && uSAstate !== '* Select Your State') validState = true;
  if (country !== 'United States') validState = true;
  if (firstname && lastname && zipcode && comments) notEmpty = true;
  if (notEmpty && country !== '* Select Your Country' && validState) {
    return false;
  }
  return true;
}

function validateForm(formData: IinquiryFormData): boolean {
  const {
    emailaddress,
  } = formData;
  // eslint-disable-next-line no-useless-escape, prefer-regex-literals
  const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
  if (regEx.test(emailaddress) && emailaddress.includes('.')) {
    return continueValidating(formData);
  } return true;
}

export default {
  handleCountryChange, handleSubmit, handleInputChange, handleUsStateChange, validateForm, createEmailApi, continueValidating,
};
