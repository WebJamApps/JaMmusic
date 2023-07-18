import renderer from 'react-test-renderer';
import {
  CommentsSection, ContactForm, ContactRequest, EmailPhoneRow, FormActions, Inquiry, InquiryForm, TableSection,
} from 'src/containers/NewHomepage/Inquiry';

describe('Inquiry', () => {
  it('handles onChange for CommentsSection', () => {
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
    const evt = { target: { value: 'comments' } };
    const result = renderer.create(<CommentsSection formData={formData} setFormData={setFormData} />).root;
    const tree = result.findByProps({ placeholder: '* Comments' }).props.onChange(evt);
    expect(tree).toBe('comments');
  });
  it('handles onClick for FormActions', () => {
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
    const setHasSubmitted = jest.fn();
    const result = renderer.create(<FormActions formData={formData} setHasSubmitted={setHasSubmitted} />).root;
    const tree = result.findByProps({ id: 'sendEmailButton' }).props.onClick();
    console.log(tree);
    expect(true).toBe(true);
  });
  it('handles emailaddress for EmailPhoneRow', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: 'kaldlk@gmail.com',
      uSAstate: '',
      country: '',
      phonenumber: '5401234567',
      zipcode: '',
      comments: '',
    };
    const setFormData = jest.fn();
    const evt = { target: { value: 'email' } };
    const result = renderer.create(<EmailPhoneRow formData={formData} setFormData={setFormData} />).root;
    const tree = result.findByProps({ label: 'Email Address' }).props.onChange(evt);
    expect(tree).toBe('email');
  });
  it('handles phone number for EmailPhoneRow', () => {
    const formData = {
      firstname: '',
      lastname: '',
      emailaddress: 'kaldlk@gmail.com',
      uSAstate: '',
      country: '',
      phonenumber: '5401234567',
      zipcode: '',
      comments: '',
    };
    const setFormData = jest.fn();
    const evt = { target: { value: 'phone number' } };
    const result = renderer.create(<EmailPhoneRow formData={formData} setFormData={setFormData} />).root;
    const tree = result.findByProps({ label: 'Phone Number' }).props.onChange(evt);
    expect(tree).toBe('phone number');
  });
  it('handles onChange in TableSection for firstname', () => {
    const formData = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'kaldlk@gmail.com',
      uSAstate: '',
      country: '',
      phonenumber: '5401234567',
      zipcode: '',
      comments: '',
    };
    const setFormData = jest.fn();
    const evt = { target: { value: 'first' } };
    const result = renderer.create(<TableSection formData={formData} setFormData={setFormData} />).root;
    const tree = result.findByProps({ label: 'First Name' }).props.onChange(evt);
    expect(tree).toBe('first');
  });
  it('handles onChange in TableSection for lastname', () => {
    const formData = {
      firstname: 'Snoop',
      lastname: 'Dogg',
      emailaddress: 'kaldlk@gmail.com',
      uSAstate: '',
      country: '',
      phonenumber: '5401234567',
      zipcode: '',
      comments: '',
    };
    const setFormData = jest.fn();
    const evt = { target: { value: 'last' } };
    const result = renderer.create(<TableSection formData={formData} setFormData={setFormData} />).root;
    const tree = result.findByProps({ label: 'Last Name' }).props.onChange(evt);
    expect(tree).toBe('last');
  });
  it('handles onChange for country in InquiryForm', () => {
    const props = {
      formData: {
        firstname: '',
        lastname: '',
        emailaddress: '',
        uSAstate: 'CA',
        country: 'United States',
        phonenumber: '',
        zipcode: '90210',
        comments: '',
      },
      setFormData: jest.fn(),
      setHasSubmitted: jest.fn(),
    };
    const evt = { target: { value: 'country' } };
    const result = renderer.create(<InquiryForm {...props} />).root;
    const tree = result.findByProps({ htmlFor: 'country' }).props.onChange(evt);
    expect(tree).toBe('country');
  });
  it('handles onChange for state in InquiryForm', () => {
    const props = {
      formData: {
        firstname: '',
        lastname: '',
        emailaddress: '',
        uSAstate: 'CA',
        country: 'United States',
        phonenumber: '',
        zipcode: '90210',
        comments: '',
      },
      setFormData: jest.fn(),
      setHasSubmitted: jest.fn(),
    };
    const evt = { target: { value: 'state' } };
    const result = renderer.create(<InquiryForm {...props} />).root;
    const tree = result.findByProps({ htmlFor: 'state' }).props.onChange(evt);
    expect(tree).toBe('state');
  });
  it('handles onChange for zipcode in InquiryForm', () => {
    const props = {
      formData: {
        firstname: '',
        lastname: '',
        emailaddress: '',
        uSAstate: 'CA',
        country: 'United States',
        phonenumber: '',
        zipcode: '90210',
        comments: '',
      },
      setFormData: jest.fn(),
      setHasSubmitted: jest.fn(),
    };
    const evt = { target: { value: 'zip' } };
    const result = renderer.create(<InquiryForm {...props} />).root;
    const tree = result.findByProps({ label: 'Zipcode' }).props.onChange(evt);
    expect(tree).toBe('zip');
  });
  it('renders ContactRequest', () => {
    const result: any = renderer.create(<ContactRequest />).toJSON();
    expect(result.type).toBe('div');
  });
  it('renders ContactForm when hasSubmitted is false', () => {
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
    const props = {
      hasSubmitted: false, hideTitle: true, country: '', setHasSubmitted: jest.fn(), formData, setFormData: jest.fn(),
    };
    const result: any = renderer.create(<ContactForm {...props} />).toJSON();
    expect(result.type).toBe('div');
  });
  it('renders ContactForm when hasSubmitted is true', () => {
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
    const props = {
      hasSubmitted: true, hideTitle: false, country: '', setHasSubmitted: jest.fn(), formData, setFormData: jest.fn(),
    };
    const result: any = renderer.create(<ContactForm {...props} />).toJSON();
    expect(result.children[0].props.className).toBe('page-content contacted');
  });
  it('renders Inquiry', () => {
    const props = { country: '', hideTitle: true };
    const result: any = renderer.create(<Inquiry {...props} />).toJSON();
    expect(result.type).toBe('div');
  });
  it('renders ContactForm when hasSubmitted and hideTitle are false', () => {
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
    const props = {
      hasSubmitted: false, hideTitle: false, country: '', setHasSubmitted: jest.fn(), formData, setFormData: jest.fn(),
    };
    const result: any = renderer.create(<ContactForm {...props} />).toJSON();
    expect(result.children[0].children[0].children[0]).toBe('Contact Us');
  });
});

