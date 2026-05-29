import { vi } from 'vitest';
import utils from 'src/containers/Homepage/Inquiry/utils';

describe('Inquiry utils', () => {

  it('handleCountryChange', () => {
    const value = 'any';
    const evt: any = { target: { value } };
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: '',
      uSAstate: '',
      country: '',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const setFormData = vi.fn();
    utils.handleCountryChange(evt, formData, setFormData);
    expect(setFormData).toHaveBeenCalledWith({ ...formData, country: 'any' });
  });
  it('createEmailApi', async () => {
    const emailForm = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'snoop@yahoo',
      uSAstate: 'CA',
      country: 'USA',
      phonenumber: '0000000000',
      zipcode: '90210',
      comments: 'none',
    };
    const setHasSubmitted = vi.fn();
    const setSubmitError = vi.fn();
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await utils.createEmailApi(emailForm, setHasSubmitted, setSubmitError);

    expect(setHasSubmitted).toHaveBeenCalledWith(true);
    expect(setSubmitError).not.toHaveBeenCalled();
  });
  it('catches error for createEmailApi', async () => {
    const emailForm = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'snoop@yahoo.com',
      uSAstate: 'CA',
      country: 'USA',
      phonenumber: '0000000000',
      zipcode: '90210',
      comments: 'none',
    };
    const setHasSubmitted = vi.fn();
    const setSubmitError = vi.fn();
    const err = 'error';
    global.fetch = vi.fn().mockRejectedValueOnce(new Error(err));

    await utils.createEmailApi(emailForm, setHasSubmitted, setSubmitError);

    expect(setHasSubmitted).toHaveBeenCalledTimes(0);
    expect(setSubmitError).toHaveBeenCalledWith(true);
  });
  it('handleSubmit', async () => {
    const evt: any = { preventDefault: vi.fn(), target: { value: 'mouse' } };
    const emailForm = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'snoop@yahoo.com',
      uSAstate: 'CA',
      country: 'USA',
      phonenumber: '0000000000',
      zipcode: '90210',
      comments: 'none',
    };
    const setHasSubmitted = vi.fn();
    const setSubmitError = vi.fn();
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await utils.handleSubmit(evt, emailForm, setHasSubmitted, setSubmitError);
    expect(setHasSubmitted).toHaveBeenCalled();
  });
  it('handleInputChange', () => {
    const evt: any = { target: { value: 'any', id: '1' } };
    const formData = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'snoop@yahoo',
      uSAstate: 'CA',
      country: 'USA',
      phonenumber: '0000000000',
      zipcode: '90210',
      comments: 'none',
    };
    const setFormData = vi.fn();
    utils.handleInputChange(evt, formData, setFormData);
    expect(setFormData).toHaveBeenCalled();
  });
  it('handleUsStateChange', () => {
    const value = 'any';
    const evt: any = { target: { value } };
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: '',
      uSAstate: '',
      country: '',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const setFormData = vi.fn();
    utils.handleUsStateChange(evt, formData, setFormData);
    expect(setFormData).toHaveBeenCalledWith({ ...formData, uSAstate: 'any' });
  });
  it('continueValidating when form is blank', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: '',
      uSAstate: '* Select Your State',
      country: '* Select Your Country',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const result = utils.continueValidating(formData);
    expect(result).toBe(true);
  });
  it('continueValidating when fields are valid', () => {
    const formData = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: '',
      uSAstate: 'VA',
      country: 'United States',
      phonenumber: '',
      zipcode: '90210',
      comments: 'some',
    };
    const result = utils.continueValidating(formData);
    expect(result).toBe(false);
  });
  it('continueValidating when state field is filled', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: '',
      uSAstate: '* Select Your State',
      country: 'United States',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const result = utils.continueValidating(formData);
    expect(result).toBe(true);
  });
  it('validateForm with "."', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: 'snoop@yahoo.com',
      uSAstate: '',
      country: '',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const result = utils.validateForm(formData);
    expect(result).toBe(true);
  });
  it('validateForm without "."', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: 'snoop@yahoo_com',
      uSAstate: '',
      country: '',
      phonenumber: '',
      zipcode: '',
      comments: '',
    };
    const result = utils.validateForm(formData);
    expect(result).toBe(true);
  });
});
