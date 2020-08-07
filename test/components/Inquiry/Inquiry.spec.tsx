import React from 'react';
import { shallow } from 'enzyme';
import Inquiry from '../../../src/components/Inquiry';

describe('Inquiry Form', () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow<Inquiry>(<Inquiry />);
  });
  it('is defined', () => {
    expect(Inquiry).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('displays the usa state dropdown when country selected is United States', () => {
    wrapper.instance().setState({ country: 'United States' });
    const dropdown = wrapper.find('select#state').get(0);
    dropdown.props.onChange({ target: { value: 'Alaska' } });
    expect(wrapper.instance().state.uSAstate).toBe('Alaska');
  });
  it('calls on change for text input', () => {
    wrapper.instance().setState = jest.fn();
    const evt:any = { target: { id: 'hi', value: '11 ' } };
    wrapper.instance().onInputChange(evt);
    expect(wrapper.instance().setState).toHaveBeenCalled();
  });
  it('calls on change for uSAstate dropdown', () => {
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.uSAstate).toBe('Alaska'); });
    wrapper.instance().onChange({ target: { value: 'Alaska' } }, true);
  });
  it('calls handleChange for country dropdown', () => {
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.country).toBe('Spain'); });
    wrapper.instance().handleCountryChange({ target: { value: 'Spain' } }, true);
  });
  it('checks for invalid phone numbers', () => {
    wrapper.setState({
      phonenumber: '540',
      validPhoneNumber: false,
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(true);
  });
  it('returns the validation', () => {
    wrapper.setState({
      firstname: 'Bob',
      lastname: 'McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
      formError: '',
      country: 'United States',
      uSAstate: 'Alaska',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  it('returns the validation after fixing email format', () => {
    wrapper.setState({
      firstname: 'Bob',
      lastname: 'McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
      formError: 'Invalid email format',
      country: 'United States',
      uSAstate: 'Alaska',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  it('returns the validation when bad email format', () => {
    wrapper.setState({
      firstname: 'Bob',
      lastname: 'McBobPerson',
      emailaddress: 'example-example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
      formError: '',
      country: 'United States',
      uSAstate: 'Alaska',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(true);
  });
  it('returns the validation when bad phone number', () => {
    wrapper.setState({
      firstname: 'Bob',
      lastname: 'McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '540',
      validPhoneNumber: true,
      validEmail: true,
      formError: '',
      country: 'United States',
      uSAstate: 'Alaska',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(true);
  });
  it('returns the validation when form not complete', () => {
    wrapper.setState({
      firstname: 'Bob',
      lastname: 'McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
      formError: 'Ten-digit phone number',
      country: 'United States',
      uSAstate: '--',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(true);
  });
  it('calls the email API', () => {
    wrapper.instance().superagent.post = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }));
    wrapper.instance().setState = jest.fn((obJ) => { expect(obJ.submitted).toBe(true); });
    wrapper.instance().createEmailApi({ submitted: true });
  });
  it('creates an email', async () => {
    wrapper.instance().superagent.post = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }));
    wrapper.update();
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      uSAstate: 'Virginia',
    });
    const result = await wrapper.instance().createEmail();
    expect(result).toBe(200);
  });
  it('catches error when posting email to backend', async () => {
    wrapper.instance().superagent.post = jest.fn(() => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }));
    wrapper.update();
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      uSAstate: 'Virginia',
    });
    await expect(wrapper.instance().createEmail()).rejects.toThrow('bad');
  });
  it('calls the thank you statement', () => {
    wrapper.setState({
      submitted: true,
    });
    expect(wrapper.find('div.contacted').exists()).toBe(true);
  });
  it('handles change to set the comments', () => {
    wrapper.instance().setState = jest.fn();
    const commentsSec = wrapper.instance().commentsSection('');
    const cs = shallow(commentsSec);
    cs.find('textarea').at(0).simulate('change', { target: { name: 'comments', value: 'howdy' } });
    expect(wrapper.instance().setState).toHaveBeenCalled();
  });
});
