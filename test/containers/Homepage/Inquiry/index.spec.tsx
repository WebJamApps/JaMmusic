import { vi } from 'vitest';
import {
  render, screen, fireEvent, within,
} from '@testing-library/react';
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
    const props = { country: '', hideTitle: true, form: 'webjam-homepage' };
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

  it('renders hidden trap field with accessibility attributes', () => {
    const { container } = render(
      <InquiryForm
        formData={formData}
        setFormData={vi.fn()}
        setHasSubmitted={vi.fn()}
        setSubmitError={vi.fn()}
      />,
    );
    const trapInput = container.querySelector('#website') as HTMLInputElement;
    expect(trapInput).toBeInTheDocument();
    expect(trapInput).toHaveAttribute('type', 'text');
    expect(trapInput).toHaveAttribute('name', 'website');
    expect(trapInput).toHaveAttribute('tabindex', '-1');
    expect(trapInput).toHaveAttribute('autocomplete', 'off');
    expect(trapInput).toHaveAttribute('aria-hidden', 'true');
    expect(trapInput).toHaveStyle({ display: 'none' });
  });

  it('handles onChange for trap field website in InquiryForm', () => {
    const setFormData = vi.fn();
    const { container } = render(
      <InquiryForm
        formData={formData}
        setFormData={setFormData}
        setHasSubmitted={vi.fn()}
        setSubmitError={vi.fn()}
      />,
    );
    const trapInput = container.querySelector('#website')!;
    fireEvent.change(trapInput, { target: { value: 'bot-spam-url' } });
    expect(setFormData).toHaveBeenCalled();
  });

  it('renders Inquiry with explicit form prop and initializes payload metadata', () => {
    const handleSubmitSpy = vi.spyOn(utils, 'handleSubmit').mockImplementation(() => Promise.resolve());
    vi.spyOn(utils, 'validateForm').mockReturnValue(false);

    render(<Inquiry country="United States" hideTitle form="jam-bookus" />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(handleSubmitSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        form: 'jam-bookus',
        website: '',
        formLoadedAt: expect.any(Number),
      }),
      expect.any(Function),
      expect.any(Function),
    );
  });

  describe('booking fields in InquiryForm & VenueAddressInput', () => {
    it('does NOT render booking fields when showBookingFields is false', () => {
      render(
        <InquiryForm
          formData={{ ...formData, form: 'webjam-homepage' }}
          showBookingFields={false}
          setFormData={vi.fn()}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );
      expect(screen.queryByLabelText(/event date/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/event type/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/venue address/i)).not.toBeInTheDocument();
    });

    it('renders booking fields when showBookingFields is true', () => {
      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={vi.fn()}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );
      expect(screen.getByPlaceholderText('* Event Date')).toBeInTheDocument();
      expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('* Venue Address')).toBeInTheDocument();
    });

    it('handles onChange for eventDate', () => {
      const setFormData = vi.fn();
      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );
      const dateInput = screen.getByPlaceholderText('* Event Date');
      fireEvent.change(dateInput, { target: { id: 'eventDate', value: '2026-12-25' } });
      expect(setFormData).toHaveBeenCalled();
    });

    it('handles onChange for eventType', () => {
      const setFormData = vi.fn();
      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );
      const typeSelect = screen.getByLabelText(/event type/i);
      fireEvent.change(typeSelect, { target: { id: 'eventType', value: 'wedding' } });
      expect(setFormData).toHaveBeenCalled();
    });

    it('VenueAddressInput falls back when GOOGLE_MAPS_API_KEY is unset and handles typing', () => {
      const originalKey = process.env.GOOGLE_MAPS_API_KEY;
      delete process.env.GOOGLE_MAPS_API_KEY;
      const setFormData = vi.fn();

      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );

      expect(
        screen.getByText("Address suggestions are unavailable. Type the venue's full street address."),
      ).toBeInTheDocument();

      const venueInput = screen.getByPlaceholderText('* Venue Address');
      fireEvent.change(venueInput, { target: { value: '123 Typed St' } });
      expect(setFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          venueAddress: '123 Typed St',
          venuePlaceId: '',
        }),
      );

      process.env.GOOGLE_MAPS_API_KEY = originalKey;
    });

    it('VenueAddressInput handles script rejection and switches to fallback mode', async () => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
      const googlePlacesModule = await import('src/containers/Homepage/Inquiry/googlePlaces');
      vi.spyOn(googlePlacesModule, 'loadGoogleMapsScript').mockRejectedValue(new Error('Script blocked'));
      const setFormData = vi.fn();

      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus', venueAddress: 'prefilled' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );

      await vi.waitFor(() => {
        expect(
          screen.getByText("Address suggestions are unavailable. Type the venue's full street address."),
        ).toBeInTheDocument();
      });
      expect(setFormData).toHaveBeenCalledWith(expect.objectContaining({ venuePlaceId: '' }));
    });

    it('VenueAddressInput handles suggestions and picking suggestion via click and Enter', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
      const googlePlacesModule = await import('src/containers/Homepage/Inquiry/googlePlaces');
      vi.spyOn(googlePlacesModule, 'loadGoogleMapsScript').mockResolvedValue();
      vi.spyOn(googlePlacesModule, 'fetchSuggestions').mockResolvedValue([
        { placeId: 'place-1', description: 'Venue One, Salem, VA' },
        { placeId: 'place-2', description: 'Venue Two, Roanoke, VA' },
      ]);
      vi.spyOn(googlePlacesModule, 'fetchPlaceAddress').mockResolvedValue('Venue One, 123 Main St, Salem, VA');

      const setFormData = vi.fn();
      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );

      const venueInput = screen.getByPlaceholderText('* Venue Address');
      fireEvent.change(venueInput, { target: { value: 'Ven' } });

      await vi.advanceTimersByTimeAsync(350);

      const listbox = await screen.findByRole('listbox');
      expect(listbox).toBeInTheDocument();
      const options = within(listbox).getAllByRole('option');
      expect(options).toHaveLength(2);

      // Select first option
      fireEvent.click(options[0]);
      await vi.advanceTimersByTimeAsync(10);

      expect(setFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          venuePlaceId: 'place-1',
          venueAddress: '',
        }),
      );

      vi.useRealTimers();
    });

    it('VenueAddressInput triggers fallback when fetchSuggestions throws', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
      const googlePlacesModule = await import('src/containers/Homepage/Inquiry/googlePlaces');
      vi.spyOn(googlePlacesModule, 'loadGoogleMapsScript').mockResolvedValue();
      vi.spyOn(googlePlacesModule, 'fetchSuggestions').mockRejectedValue(new Error('Network error'));

      const setFormData = vi.fn();
      render(
        <InquiryForm
          formData={{ ...formData, form: 'jam-bookus' }}
          showBookingFields={true}
          setFormData={setFormData}
          setHasSubmitted={vi.fn()}
          setSubmitError={vi.fn()}
        />,
      );

      const venueInput = screen.getByPlaceholderText('* Venue Address');
      fireEvent.change(venueInput, { target: { value: 'Search error' } });

      await vi.advanceTimersByTimeAsync(350);

      expect(
        await screen.findByText("Address suggestions are unavailable. Type the venue's full street address."),
      ).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
