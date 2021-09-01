/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import { Button, Select } from 'react-materialize';
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
    const dropdown = wrapper.find(Select).get(1);
    dropdown.props.onChange({ target: { value: 'Virginia' } });
    expect(wrapper.instance().state.uSAstate).toBe('Virginia');
  });
  it('calls on change for text input', () => {
    wrapper.instance().setState = jest.fn();
    const evt: any = { target: { id: 'hi', value: '11 ' } };
    wrapper.instance().onInputChange(evt);
    expect(wrapper.instance().setState).toHaveBeenCalled();
  });
  it('calls on change for uSAstate dropdown', () => {
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.uSAstate).toBe('Alaska'); });
    wrapper.instance().onChange({ target: { value: 'Alaska' } }, true);
  });
  it('calls on change for country dropdown', () => {
    wrapper.instance().setState = jest.fn((cb) => cb());
    wrapper.instance().onChange({ target: { id: 'countryState', value: 'USA' } }, false);
    expect(wrapper.instance().setState).toHaveBeenCalled();
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
      validState: true,
      formError: 'Invalid email format',
      country: 'Europe',
      uSAstate: '* Select Your State',
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
  it('returns the validation when form not complete', () => {
    wrapper.setState({
      firstname: '',
      lastname: 'McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
      formError: 'Ten-digit phone number',
      country: 'United States',
      uSAstate: '* Select Your State',
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
    const evt:any = { preventDefault: () => { } };
    wrapper.instance().superagent.post = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }));
    wrapper.update();
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      uSAstate: 'Virginia',
    });
    const result = await wrapper.instance().createEmail(evt);
    expect(result).toBe(200);
  });
  it('catches error when posting email to backend', async () => {
    const evt:any = { preventDefault: () => { } };
    wrapper.instance().superagent.post = jest.fn(() => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }));
    wrapper.update();
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      uSAstate: 'Virginia',
    });
    await expect(wrapper.instance().createEmail(evt)).rejects.toThrow('bad');
  });
  it('calls the thank you statement', () => {
    wrapper.setState({
      submitted: true,
    });
    expect(wrapper.find('div.contacted').exists()).toBe(true);
  });
  // it('handles change to set the comments', () => {
  //   wrapper.instance().setState = jest.fn();
  //   const commentsSec = wrapper.instance().commentsSection('');
  //   const cs = shallow(commentsSec);
  //   cs.find('textarea').at(0).simulate('change', { target: { name: 'comments', value: 'howdy' } });
  //   expect(wrapper.instance().setState).toHaveBeenCalled();
  // });
  it('handles onClick for button', () => {
    const evt:any = { preventDefault: () => { } };
    wrapper.isFormValid = jest.fn(() => false);
    wrapper.instance().createEmail = jest.fn();
    wrapper.update();
    const button = wrapper.find(Button).get(0);
    button.props.onClick(evt);
    expect(wrapper.instance().createEmail).toHaveBeenCalled();
  });
});
