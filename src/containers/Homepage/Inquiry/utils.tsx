import type { IinquiryFormData } from '.';

export const EVENT_TYPES = [
  { value: 'brewery-winery', label: 'Brewery or winery' },
  { value: 'restaurant-bar', label: 'Restaurant or bar' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'private-party', label: 'Private party' },
  { value: 'festival-fair', label: 'Festival or fair' },
  { value: 'church', label: 'Church event' },
  { value: 'corporate', label: 'Corporate event' },
  { value: 'other', label: 'Other' },
] as const;

export const VALID_EVENT_TYPES = EVENT_TYPES.map((t) => t.value);

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidEventDate(value?: string): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < getTodayString()) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isValidEventType(value?: string): boolean {
  return typeof value === 'string' && (VALID_EVENT_TYPES as readonly string[]).includes(value);
}

export function isValidVenue(formData: IinquiryFormData): boolean {
  if (typeof formData.venuePlaceId === 'string' && formData.venuePlaceId.trim().length > 0) {
    return true;
  }
  if (typeof formData.venueAddress === 'string' && formData.venueAddress.trim().length > 0) {
    return true;
  }
  return false;
}

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
    form, website, formLoadedAt,
    eventDate, eventType, venuePlaceId, venueAddress,
  } = formData;
  const emailForm: IinquiryFormData = {
    firstname,
    lastname,
    emailaddress,
    uSAstate,
    country,
    phonenumber,
    zipcode,
    comments: (comments || '').trim(),
    form: form || '',
    website: website || '',
    formLoadedAt,
  };
  if (eventDate) emailForm.eventDate = eventDate;
  if (eventType) emailForm.eventType = eventType;
  if (venuePlaceId) {
    emailForm.venuePlaceId = venuePlaceId;
  } else if (venueAddress && venueAddress.trim()) {
    emailForm.venueAddress = venueAddress.trim();
  }
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

function continueValidating(formData: IinquiryFormData, showBookingFields?: boolean): boolean {
  const {
    country, uSAstate, firstname, lastname, zipcode, comments,
    form, eventDate, eventType,
  } = formData;
  let validState = false, notEmpty = false;
  if (country === 'United States' && uSAstate !== '* Select Your State') validState = true;
  if (country !== 'United States') validState = true;
  if (firstname && lastname && zipcode && comments) notEmpty = true;
  if (!notEmpty || country === '* Select Your Country' || !validState) {
    return true;
  }

  const isBooking = Boolean(showBookingFields || form === 'jam-bookus');
  if (isBooking) {
    if (!isValidEventDate(eventDate)) return true;
    if (!isValidEventType(eventType)) return true;
    if (!isValidVenue(formData)) return true;
  }

  return false;
}

function validateForm(formData: IinquiryFormData, showBookingFields?: boolean): boolean {
  const {
    emailaddress,
  } = formData;
  // eslint-disable-next-line no-useless-escape, prefer-regex-literals
  const regEx = RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
  if (regEx.test(emailaddress) && emailaddress.includes('.')) {
    return continueValidating(formData, showBookingFields);
  }
  return true;
}

export default {
  handleCountryChange,
  handleSubmit,
  handleInputChange,
  handleUsStateChange,
  validateForm,
  createEmailApi,
  continueValidating,
  isValidEventDate,
  isValidEventType,
  isValidVenue,
  getTodayString,
  EVENT_TYPES,
  VALID_EVENT_TYPES,
};
