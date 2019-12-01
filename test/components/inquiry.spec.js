import React from 'react';
import { shallow } from 'enzyme';
import Inquiry from '../../src/components/inquiry';

describe('Inquiry Form', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Inquiry />);
  });
  it('is defined', () => {
    expect(Inquiry).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper.find('div.page-content').exists()).toBe(true);
  });
  it('calls on change', () => {
    wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.hi).toBe(11); });
    wrapper.instance().onChange({ preventDefault: () => {}, target: { id: 'hi', value: 11 } });
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
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      zipcode: '24179',
      phonenumber: '5405555555',
      validPhoneNumber: true,
      validEmail: true,
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  it('calls the email API', () => {
    wrapper.instance().setState = jest.fn((obJ) => { expect(obJ.submitted).toBe(true); });
    wrapper.instance().createEmailApi({ submitted: true });
  });
  it('creates an email', () => {
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      uSAstate: 'Virginia',
    });
    const result = wrapper.instance().createEmail();
    expect(result).toBe(true);
  });
  it('calls the thank you statement', () => {
    wrapper.setState({
      submitted: true,
    });
    expect(wrapper.find('div.contacted').exists()).toBe(true);
  });
  it('calls on change isSelect', () => {
    wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.uSAstate).toBe('Virginia'); });
    wrapper.setState({ country: 'United States' });
    wrapper.instance().statesDropdown({ uSAstate: 'Virginia' });
    wrapper.instance().onChange({ preventDefault: () => {}, target: { value: 'Virginia' } }, true);
  });
  it('calls handle change isSelect', () => {
    wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.country).toBe('United States'); });
    wrapper.instance().countryDropdown({ country: 'United States' });
    wrapper.instance().handleChange({ target: { value: 'United States' } }, true);
  });
  it('calls handle change to set the comments', () => {
    wrapper.instance().handleChange({ target: { value: 'howdy' } });
    expect(wrapper.instance().state.comments).toBe('howdy');
  });
  it('calls on change from the select dropdown', () => {
    wrapper.instance().onChange = jest.fn();
    wrapper.update();
    const select = wrapper.instance().statesDropdown('Florida');
    const s = shallow(select);
    s.find('select').simulate('change');
    expect(wrapper.instance().onChange).toHaveBeenCalled();
  });
  it('calls handle change from the select dropdown', () => {
    wrapper.instance().handleChange = jest.fn();
    wrapper.update();
    const select = wrapper.instance().countryDropdown('United States');
    const s = shallow(select);
    s.find('select').simulate('change');
    expect(wrapper.instance().handleChange).toHaveBeenCalled();
  });
});
