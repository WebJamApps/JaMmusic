import utils from 'src/containers/Homepage/Inquiry/utils';
import superagent from 'superagent';

jest.mock('superagent');

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
    const setFormData = jest.fn();
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
    const setHasSubmitted = jest.fn();
    const mockPost = jest.fn().mockResolvedValueOnce({});
    (superagent.post as jest.Mock).mockReturnValueOnce({ set: jest.fn().mockReturnValueOnce({ send: mockPost }) });
    await utils.createEmailApi(emailForm, setHasSubmitted);
    expect(setHasSubmitted).toHaveBeenCalledWith(true);
  });
  it('catches error for createEmailApi', async () => {
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
    const setHasSubmitted = jest.fn();
    const err = 'error';
    const mockPost = jest.fn().mockRejectedValueOnce(new Error(err));
    (superagent.post as jest.Mock).mockReturnValueOnce({ set: jest.fn().mockReturnValueOnce({ send: mockPost }) });
    await utils.createEmailApi(emailForm, setHasSubmitted);
    expect(setHasSubmitted).toHaveBeenCalledTimes(0);
  });
  it('handleSubmit', async () => {
    const evt: any = { target: { value: 'mouse' } };
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
    const setHasSubmitted = jest.fn();
    const mockPost = jest.fn().mockResolvedValueOnce({});
    const createEmailApi = (superagent.post as jest.Mock).mockReturnValueOnce({ set: jest.fn().mockReturnValueOnce({ send: mockPost }) });
    await utils.handleSubmit(evt, emailForm, setHasSubmitted);
    expect(createEmailApi).toHaveBeenCalled();
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
    const setFormData = jest.fn();
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
    const setFormData = jest.fn();
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
