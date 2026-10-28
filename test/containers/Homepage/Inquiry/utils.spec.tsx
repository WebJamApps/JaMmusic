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
  it('handleSubmit includes form, website, and formLoadedAt in payload', async () => {
    const evt = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLButtonElement>;
    const emailForm = {
      firstname: 'Josh',
      lastname: 'Sherman',
      emailaddress: 'josh@example.com',
      uSAstate: 'VA',
      country: 'United States',
      phonenumber: '5401234567',
      zipcode: '24153',
      comments: 'Need a band for a party',
      form: 'jam-bookus',
      website: '',
      formLoadedAt: 1730000000000,
    };
    const setHasSubmitted = vi.fn();
    const setSubmitError = vi.fn();
    let capturedBody: Record<string, unknown> | null = null;
    global.fetch = vi.fn().mockImplementationOnce((_url, init) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await utils.handleSubmit(evt, emailForm, setHasSubmitted, setSubmitError);

    expect(setHasSubmitted).toHaveBeenCalledWith(true);
    expect(capturedBody).toEqual({
      firstname: 'Josh',
      lastname: 'Sherman',
      emailaddress: 'josh@example.com',
      uSAstate: 'VA',
      country: 'United States',
      phonenumber: '5401234567',
      zipcode: '24153',
      comments: 'Need a band for a party',
      form: 'jam-bookus',
      website: '',
      formLoadedAt: 1730000000000,
    });
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

  describe('booking fields validation', () => {
    it('isValidEventDate checks dates correctly', () => {
      expect(utils.isValidEventDate()).toBe(false);
      expect(utils.isValidEventDate('')).toBe(false);
      expect(utils.isValidEventDate('invalid-date')).toBe(false);
      expect(utils.isValidEventDate('2015-01-01')).toBe(false);
      expect(utils.isValidEventDate('2026-02-31')).toBe(false);
      expect(utils.isValidEventDate(utils.getTodayString())).toBe(true);
      expect(utils.isValidEventDate('2099-12-31')).toBe(true);
    });

    it('isValidEventType checks event types', () => {
      expect(utils.isValidEventType()).toBe(false);
      expect(utils.isValidEventType('')).toBe(false);
      expect(utils.isValidEventType('concert')).toBe(false);
      utils.EVENT_TYPES.forEach(({ value }) => {
        expect(utils.isValidEventType(value)).toBe(true);
      });
    });

    it('isValidVenue checks placeId or address', () => {
      expect(utils.isValidVenue({} as any)).toBe(false);
      expect(utils.isValidVenue({ venuePlaceId: '' } as any)).toBe(false);
      expect(utils.isValidVenue({ venueAddress: '   ' } as any)).toBe(false);
      expect(utils.isValidVenue({ venuePlaceId: 'place-123' } as any)).toBe(true);
      expect(utils.isValidVenue({ venueAddress: '123 Main St' } as any)).toBe(true);
    });

    it('validateForm enforces booking fields when showBookingFields or jam-bookus form is active', () => {
      const baseValidStandard = {
        firstname: 'Josh',
        lastname: 'Sherman',
        emailaddress: 'josh@example.com',
        uSAstate: 'VA',
        country: 'United States',
        phonenumber: '5401234567',
        zipcode: '24153',
        comments: 'Need a duo',
        form: 'jam-bookus',
      };

      // Missing booking fields -> invalid (true)
      expect(utils.validateForm(baseValidStandard)).toBe(true);

      // Missing eventType -> invalid
      expect(
        utils.validateForm({
          ...baseValidStandard,
          eventDate: '2099-01-01',
          venuePlaceId: 'place-xyz',
        }),
      ).toBe(true);

      // Missing venue -> invalid
      expect(
        utils.validateForm({
          ...baseValidStandard,
          eventDate: '2099-01-01',
          eventType: 'wedding',
        }),
      ).toBe(true);

      // With venuePlaceId -> valid (false)
      expect(
        utils.validateForm({
          ...baseValidStandard,
          eventDate: '2099-01-01',
          eventType: 'wedding',
          venuePlaceId: 'place-xyz',
        }),
      ).toBe(false);

      // With venueAddress -> valid (false)
      expect(
        utils.validateForm({
          ...baseValidStandard,
          eventDate: '2099-01-01',
          eventType: 'brewery-winery',
          venueAddress: '456 Elm St',
        }),
      ).toBe(false);

      // Homepage form without booking fields is valid
      const homepageForm = {
        ...baseValidStandard,
        form: 'webjam-homepage',
      };
      expect(utils.validateForm(homepageForm)).toBe(false);
    });

    it('handleSubmit includes eventDate, eventType, and venuePlaceId when suggestion picked', async () => {
      const evt = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLButtonElement>;
      const formData = {
        firstname: 'Josh',
        lastname: 'Sherman',
        emailaddress: 'josh@example.com',
        uSAstate: 'VA',
        country: 'United States',
        phonenumber: '5401234567',
        zipcode: '24153',
        comments: 'Wedding booking',
        form: 'jam-bookus',
        website: '',
        formLoadedAt: 1730000000000,
        eventDate: '2099-06-15',
        eventType: 'wedding',
        venuePlaceId: 'place-abc-123',
        venueAddress: 'ignored-if-place-id-present',
      };
      const setHasSubmitted = vi.fn();
      const setSubmitError = vi.fn();
      let captured: any = null;
      global.fetch = vi.fn().mockImplementationOnce((_url, init) => {
        captured = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await utils.handleSubmit(evt, formData, setHasSubmitted, setSubmitError);

      expect(setHasSubmitted).toHaveBeenCalledWith(true);
      expect(captured.eventDate).toBe('2099-06-15');
      expect(captured.eventType).toBe('wedding');
      expect(captured.venuePlaceId).toBe('place-abc-123');
      expect(captured.venueAddress).toBeUndefined();
    });

    it('handleSubmit includes venueAddress when typed and venuePlaceId is absent', async () => {
      const evt = { preventDefault: vi.fn() } as unknown as React.MouseEvent<HTMLButtonElement>;
      const formData = {
        firstname: 'Josh',
        lastname: 'Sherman',
        emailaddress: 'josh@example.com',
        uSAstate: 'VA',
        country: 'United States',
        phonenumber: '5401234567',
        zipcode: '24153',
        comments: 'Brewery booking',
        form: 'jam-bookus',
        website: '',
        formLoadedAt: 1730000000000,
        eventDate: '2099-08-20',
        eventType: 'brewery-winery',
        venueAddress: '789 Vineyard Rd, Salem, VA',
      };
      const setHasSubmitted = vi.fn();
      const setSubmitError = vi.fn();
      let captured: any = null;
      global.fetch = vi.fn().mockImplementationOnce((_url, init) => {
        captured = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await utils.handleSubmit(evt, formData, setHasSubmitted, setSubmitError);

      expect(setHasSubmitted).toHaveBeenCalledWith(true);
      expect(captured.eventDate).toBe('2099-08-20');
      expect(captured.eventType).toBe('brewery-winery');
      expect(captured.venueAddress).toBe('789 Vineyard Rd, Salem, VA');
      expect(captured.venuePlaceId).toBeUndefined();
    });
  });
});
