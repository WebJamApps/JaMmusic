import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CommentsSection, ContactForm, ContactRequest, EmailPhoneRow, FormActions, Inquiry, InquiryError, InquiryForm, TableSection,
} from 'src/containers/Homepage/Inquiry';
import utils from 'src/containers/Homepage/Inquiry/utils';

describe('Inquiry', () => {
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

  it('handles onChange for CommentsSection', () => {
    const setFormData = vi.fn();
    render(<CommentsSection formData={formData} setFormData={setFormData} />);
    const textarea = screen.getByPlaceholderText('* Comments');
    fireEvent.change(textarea, { target: { value: 'new comments' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onClick for FormActions', () => {
    const setHasSubmitted = vi.fn();
    const setSubmitError = vi.fn();
    vi.spyOn(utils, 'validateForm').mockReturnValue(false);
    const handleSubmitSpy = vi.spyOn(utils, 'handleSubmit').mockImplementation(() => Promise.resolve());

    render(
      <FormActions formData={formData} setHasSubmitted={setHasSubmitted} setSubmitError={setSubmitError} />,
    );
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    expect(handleSubmitSpy).toHaveBeenCalled();
  });

  it('handles emailaddress for EmailPhoneRow', () => {
    const setFormData = vi.fn();
    const { container } = render(<EmailPhoneRow formData={formData} setFormData={setFormData} />);
    const emailInput = container.querySelector('#emailaddress')!;
    fireEvent.change(emailInput, { target: { value: 'email@test.com' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles phone number for EmailPhoneRow', () => {
    const setFormData = vi.fn();
    const { container } = render(<EmailPhoneRow formData={formData} setFormData={setFormData} />);
    const phoneInput = container.querySelector('#phonenumber')!;
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onChange in TableSection for firstname', () => {
    const setFormData = vi.fn();
    const { container } = render(<TableSection formData={formData} setFormData={setFormData} />);
    const firstNameInput = container.querySelector('#firstname')!;
    fireEvent.change(firstNameInput, { target: { value: 'First' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onChange in TableSection for lastname', () => {
    const setFormData = vi.fn();
    const { container } = render(<TableSection formData={formData} setFormData={setFormData} />);
    const lastNameInput = container.querySelector('#lastname')!;
    fireEvent.change(lastNameInput, { target: { value: 'Last' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onChange for country in InquiryForm', () => {
    const setFormData = vi.fn();
    const { container } = render(
      <InquiryForm
        formData={formData}
        setFormData={setFormData}
        setHasSubmitted={vi.fn()}
        setSubmitError={vi.fn()}
      />
    );
    const countrySelect = container.querySelector('#country')!;
    fireEvent.change(countrySelect, { target: { value: 'Albania' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onChange for state in InquiryForm', () => {
    const localFormData = { ...formData, country: 'United States' };
    const setFormData = vi.fn();
    const { container } = render(
      <InquiryForm
        formData={localFormData}
        setFormData={setFormData}
        setHasSubmitted={vi.fn()}
        setSubmitError={vi.fn()}
      />
    );
    const stateSelect = container.querySelector('#state')!;
    fireEvent.change(stateSelect, { target: { value: 'Virginia' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('handles onChange for zipcode in InquiryForm', () => {
    const setFormData = vi.fn();
    const { container } = render(
      <InquiryForm
        formData={formData}
        setFormData={setFormData}
        setHasSubmitted={vi.fn()}
        setSubmitError={vi.fn()}
      />
    );
    const zipInput = container.querySelector('#zipcode')!;
    fireEvent.change(zipInput, { target: { value: '12345' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('renders ContactRequest', () => {
    render(<ContactRequest />);
    expect(screen.getByText(/thank you for contacting us/i)).toBeInTheDocument();
  });

  it('renders ContactForm when hasSubmitted is false', () => {
    const props = {
      hasSubmitted: false,
      submitError: false,
      hideTitle: true,
      country: '',
      setHasSubmitted: vi.fn(),
      setSubmitError: vi.fn(),
      formData,
      setFormData: vi.fn(),
    };
    render(<ContactForm {...props} />);
    expect(screen.queryByText(/contact us/i)).not.toBeInTheDocument();
  });

  it('renders ContactForm when hasSubmitted is true', () => {
    const props = {
      hasSubmitted: true,
      submitError: false,
      hideTitle: false,
      country: '',
      setHasSubmitted: vi.fn(),
      setSubmitError: vi.fn(),
      formData,
      setFormData: vi.fn(),
    };
    render(<ContactForm {...props} />);
    expect(screen.getByText(/thank you for contacting us/i)).toBeInTheDocument();
  });

  it('renders Inquiry', () => {
    const props = { country: '', hideTitle: true };
    render(<Inquiry {...props} />);
    expect(screen.queryByText(/contact us/i)).not.toBeInTheDocument();
  });

  it('renders ContactForm when hasSubmitted and hideTitle are false', () => {
    const props = {
      hasSubmitted: false,
      submitError: false,
      hideTitle: false,
      country: '',
      setHasSubmitted: vi.fn(),
      setSubmitError: vi.fn(),
      formData,
      setFormData: vi.fn(),
    };
    render(<ContactForm {...props} />);
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });

  it('renders InquiryError standalone', () => {
    render(<InquiryError />);
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveClass('inquiryError');
    expect(errorMsg).toHaveTextContent(/sorry — we couldn’t deliver your inquiry/i);
  });

  it('ContactForm renders InquiryError when submitError is true', () => {
    const props = {
      hasSubmitted: false,
      submitError: true,
      hideTitle: true,
      country: '',
      setHasSubmitted: vi.fn(),
      setSubmitError: vi.fn(),
      formData,
      setFormData: vi.fn(),
    };
    render(<ContactForm {...props} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('ContactForm does NOT render InquiryError when submitError is false', () => {
    const props = {
      hasSubmitted: false,
      submitError: false,
      hideTitle: true,
      country: '',
      setHasSubmitted: vi.fn(),
      setSubmitError: vi.fn(),
      formData,
      setFormData: vi.fn(),
    };
    render(<ContactForm {...props} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
