import superagent from 'superagent';
import type { IinquiryFormData } from '.';

function handleCountryChange(
  event: React.ChangeEvent<HTMLSelectElement>,
  formData:IinquiryFormData,
  setFormData:(arg0:IinquiryFormData)=>void,
): void {
  setFormData({ ...formData, country: event.target.value });
}

async function createEmailApi(
  emailForm: IinquiryFormData,
  setHasSubmitted:(arg0:boolean)=>void,
): Promise<void> {
  try {
    await superagent.post(`${process.env.BackendUrl}/inquiry`)
      .set('Content-Type', 'application/json')
      .send(emailForm);
    setHasSubmitted(true);
  } catch (e) { console.log((e as Error).message); }
}

async function handleSubmit(
  evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  formData:IinquiryFormData,
  setHasSubmitted:(arg0:boolean)=>void,
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
  await createEmailApi(emailForm, setHasSubmitted);
}

export default { handleCountryChange, handleSubmit };
