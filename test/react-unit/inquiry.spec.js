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
  // it('calls on change isSelect', () => {
  //   wrapper.instance().setState = jest.fn((boobyJ) => { expect(boobyJ.uSAstate).toBe('Virginia'); });
  //   wrapper.instance.statesDropdown({ uSAstate: 'Virginia' });
  //   wrapper.instance().onChange({ preventDefault: () => {}, uSAstate: { value: 'Virginia' } });
  // });
  // it('calls handle change', () => {
  //   wrapper.instance().setState = jest.fn((obJ) => { expect(obJ.comments).toBe('Comment'); });
  //   wrapper.instance().handleChange({ comments: { value: 'Comment' } });
  // });
  it('returns the validation', () => {
    wrapper.setState({
      fullname: 'Bob McBobPerson',
      emailaddress: 'example@example.com',
      comments: 'A comment',
      validEmail: true,
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  // it('creates an email', () => {
  //   wrapper.setState({
  //     fullname: 'Bob McBobPerson',
  //     emailaddress: 'example@example.com',
  //     comments: 'A comment',
  //     uSAstate: 'Virginia',
  //   });
  //   const result = wrapper.instance().createEmail();
  //   expect(result).toBe(true);
  // });
  it('calls the thank you statement', () => {
    wrapper.setState({
      submitted: true,
    });
    expect(wrapper.find('div.contacted').exists()).toBe(true);
  });
});
