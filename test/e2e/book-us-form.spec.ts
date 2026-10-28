import { test, expect } from '@playwright/test';

interface IinquiryPayload {
  firstname?: string;
  lastname?: string;
  emailaddress?: string;
  phonenumber?: string;
  country?: string;
  uSAstate?: string;
  zipcode?: string;
  comments?: string;
  form?: string;
  website?: string;
  formLoadedAt?: number;
  eventDate?: string;
  eventType?: string;
  venuePlaceId?: string;
  venueAddress?: string;
}

test.describe('Book Us booking fields & Google address suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    // Prevent socketcluster hangs and websocket errors
    await page.routeWebSocket(/.*/, (ws) => ws.close());
  });

  test('fills booking fields with Google script stubbed and asserts payload carries venuePlaceId', async ({ page }) => {
    let capturedPayload: IinquiryPayload | null = null;

    // Stub Google Maps Places script before page load
    await page.route(/.*maps\.googleapis\.com.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.google = {
            maps: {
              importLibrary: async (lib) => {
                if (lib === 'places') {
                  return {
                    AutocompleteSessionToken: function() {},
                    AutocompleteSuggestion: {
                      fetchAutocompleteSuggestions: async ({ input }) => ({
                        suggestions: [
                          {
                            placePrediction: {
                              placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                              text: { toString: () => 'Salem Civic Center, 1001 Roanoke Blvd, Salem, VA 24153' },
                              toPlace: () => ({
                                id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                                formattedAddress: 'Salem Civic Center, 1001 Roanoke Blvd, Salem, VA 24153',
                                fetchFields: async () => ({}),
                              }),
                            },
                          },
                        ],
                      }),
                    },
                    Place: function({ id }) {
                      return {
                        id,
                        formattedAddress: 'Salem Civic Center, 1001 Roanoke Blvd, Salem, VA 24153',
                        fetchFields: async () => ({}),
                      };
                    },
                  };
                }
              },
              places: {
                PlacesServiceStatus: { OK: 'OK' },
                AutocompleteService: function() {
                  return {
                    getPlacePredictions: (opts, cb) => cb([
                      {
                        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                        description: 'Salem Civic Center, 1001 Roanoke Blvd, Salem, VA 24153',
                      },
                    ], 'OK'),
                  };
                },
                PlacesService: function() {
                  return {
                    getDetails: (opts, cb) => cb({
                      formatted_address: 'Salem Civic Center, 1001 Roanoke Blvd, Salem, VA 24153',
                    }, 'OK'),
                  };
                },
              },
            },
          };
          if (typeof window.__googleMapsCallback === 'function') {
            window.__googleMapsCallback();
          }
        `,
      });
    });

    // Mock backend endpoint
    await page.route('http://localhost:7000/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/inquiry') {
        capturedPayload = route.request().postDataJSON() as IinquiryPayload;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Inquiry delivered' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/music/bookus', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#new-contact')).toBeVisible();

    // Verify booking fields are visible
    const eventDateInput = page.locator('#eventDate');
    const eventTypeSelect = page.locator('#eventType');
    const venueAddressInput = page.locator('#venueAddress');
    await expect(eventDateInput).toBeVisible();
    await expect(eventTypeSelect).toBeVisible();
    await expect(venueAddressInput).toBeVisible();

    // Fill valid form fields
    await page.locator('#firstname').fill('Maria');
    await page.locator('#lastname').fill('Sherman');
    await page.locator('#emailaddress').fill('maria@example.com');
    await page.locator('#phonenumber').fill('540-555-5678');
    await page.locator('#state').selectOption('Virginia');
    await page.locator('#zipcode').fill('24018');

    // Fill booking fields
    await eventDateInput.fill('2026-12-25');
    await eventTypeSelect.selectOption('wedding');

    // Type address to trigger suggestions
    await venueAddressInput.fill('Salem Civic');
    const suggestionOption = page.locator('#venue-suggestions-list [role="option"]').first();
    await expect(suggestionOption).toBeVisible({ timeout: 5000 });
    await suggestionOption.click();

    // Add comments
    await page.getByPlaceholder('* Comments').fill('Booking inquiry for wedding ceremony and cocktail hour.');

    const sendButton = page.locator('#sendEmailButton');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText('Thank you for contacting us.')).toBeVisible();

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload!;
    expect(payload.form).toBe('jam-bookus');
    expect(payload.eventDate).toBe('2026-12-25');
    expect(payload.eventType).toBe('wedding');
    expect(payload.venuePlaceId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
    expect(payload.venueAddress).toBeUndefined();
  });

  test('aborts Google script, types an address, and asserts payload carries venueAddress', async ({ page }) => {
    let capturedPayload: IinquiryPayload | null = null;

    // Abort Google Maps script to trigger fallback
    await page.route(/.*maps\.googleapis\.com.*/, async (route) => {
      await route.abort();
    });

    // Mock backend endpoint
    await page.route('http://localhost:7000/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/inquiry') {
        capturedPayload = route.request().postDataJSON() as IinquiryPayload;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Inquiry delivered' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/music/bookus', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#new-contact')).toBeVisible();

    // Verify unavailable note is displayed
    await expect(
      page.getByText("Address suggestions are unavailable. Type the venue's full street address."),
    ).toBeVisible();

    // Fill valid form fields
    await page.locator('#firstname').fill('Josh');
    await page.locator('#lastname').fill('Sherman');
    await page.locator('#emailaddress').fill('josh@example.com');
    await page.locator('#phonenumber').fill('540-555-1234');
    await page.locator('#state').selectOption('Virginia');
    await page.locator('#zipcode').fill('24153');

    // Fill booking fields
    await page.locator('#eventDate').fill('2026-11-20');
    await page.locator('#eventType').selectOption('brewery-winery');

    // Send button remains disabled until address is typed
    const sendButton = page.locator('#sendEmailButton');
    await page.getByPlaceholder('* Comments').fill('Booking inquiry for brewery acoustic session.');
    await expect(sendButton).toBeDisabled();

    // Type the venue address
    await page.locator('#venueAddress').fill('100 Main St, Salem, VA 24153');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText('Thank you for contacting us.')).toBeVisible();

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload!;
    expect(payload.form).toBe('jam-bookus');
    expect(payload.eventDate).toBe('2026-11-20');
    expect(payload.eventType).toBe('brewery-winery');
    expect(payload.venueAddress).toBe('100 Main St, Salem, VA 24153');
    expect(payload.venuePlaceId).toBeUndefined();
  });
});
