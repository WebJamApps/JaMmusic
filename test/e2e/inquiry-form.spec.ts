import { test, expect } from '@playwright/test';

// E2E test verifying inquiry form submissions send the form name, hidden trap field, and load time:
// 1. Web Jam homepage form sends form='webjam-homepage', empty website, and formLoadedAt
// 2. Book Us form sends form='jam-bookus', empty website, and formLoadedAt
// 3. Trap field submission sends populated website field when targeted by a bot

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
}

test.describe('Inquiry forms spam protection & form labeling', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    // Prevent socketcluster hangs and external script errors
    await page.routeWebSocket(/.*/, (ws) => ws.close());
    await page.route(/^https:\/\//, (route) => route.abort());
  });

  test('Web Jam homepage form sends form="webjam-homepage", empty website, and formLoadedAt', async ({ page }) => {
    let capturedPayload: IinquiryPayload | null = null;

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

    await page.goto('/new-homepage', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#new-contact')).toBeVisible();

    // Verify trap field is present in DOM but hidden
    const trapField = page.locator('#website');
    await expect(trapField).toHaveAttribute('type', 'text');
    await expect(trapField).toHaveAttribute('name', 'website');
    await expect(trapField).toHaveAttribute('tabindex', '-1');
    await expect(trapField).toHaveAttribute('autocomplete', 'off');
    await expect(trapField).toHaveAttribute('aria-hidden', 'true');
    await expect(trapField).toBeHidden();

    // Fill valid form fields
    await page.locator('#firstname').fill('Josh');
    await page.locator('#lastname').fill('Sherman');
    await page.locator('#emailaddress').fill('josh@web-jam.com');
    await page.locator('#phonenumber').fill('540-555-1234');
    await page.locator('#country').selectOption('United States');
    await page.locator('#state').selectOption('Virginia');
    await page.locator('#zipcode').fill('24153');
    await page.getByPlaceholder('* Comments').fill('Website project consultation inquiry.');

    const sendButton = page.locator('#sendEmailButton');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText('Thank you for contacting us.')).toBeVisible();

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload!;
    expect(payload.form).toBe('webjam-homepage');
    expect(payload.website).toBe('');
    expect(typeof payload.formLoadedAt).toBe('number');
    expect(payload.formLoadedAt).toBeGreaterThan(0);
    expect(payload.formLoadedAt).toBeLessThanOrEqual(Date.now());
    expect(payload.firstname).toBe('Josh');
    expect(payload.lastname).toBe('Sherman');
    expect(payload.emailaddress).toBe('josh@web-jam.com');
    expect(payload.phonenumber).toBe('540-555-1234');
    expect(payload.country).toBe('United States');
    expect(payload.uSAstate).toBe('Virginia');
    expect(payload.zipcode).toBe('24153');
    expect(payload.comments).toBe('Website project consultation inquiry.');
  });

  test('Book Us form sends form="jam-bookus", empty website, and formLoadedAt', async ({ page }) => {
    let capturedPayload: IinquiryPayload | null = null;

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

    // Verify trap field is present in DOM but hidden
    const trapField = page.locator('#website');
    await expect(trapField).toHaveAttribute('type', 'text');
    await expect(trapField).toHaveAttribute('name', 'website');
    await expect(trapField).toHaveAttribute('tabindex', '-1');
    await expect(trapField).toHaveAttribute('autocomplete', 'off');
    await expect(trapField).toHaveAttribute('aria-hidden', 'true');
    await expect(trapField).toBeHidden();

    // Fill valid form fields (country is locked to United States on Book Us)
    await page.locator('#firstname').fill('Maria');
    await page.locator('#lastname').fill('Sherman');
    await page.locator('#emailaddress').fill('maria@example.com');
    await page.locator('#phonenumber').fill('540-555-5678');
    await page.locator('#state').selectOption('Virginia');
    await page.locator('#zipcode').fill('24018');
    await page.locator('#eventDate').fill('2026-12-15');
    await page.locator('#eventType').selectOption('private-party');
    await page.locator('#venueAddress').fill('123 Music Lane, Roanoke, VA 24018');
    await page.getByPlaceholder('* Comments').fill('Booking inquiry for acoustic live music event.');

    const sendButton = page.locator('#sendEmailButton');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText('Thank you for contacting us.')).toBeVisible();

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload!;
    expect(payload.form).toBe('jam-bookus');
    expect(payload.website).toBe('');
    expect(typeof payload.formLoadedAt).toBe('number');
    expect(payload.formLoadedAt).toBeGreaterThan(0);
    expect(payload.formLoadedAt).toBeLessThanOrEqual(Date.now());
    expect(payload.firstname).toBe('Maria');
    expect(payload.lastname).toBe('Sherman');
    expect(payload.emailaddress).toBe('maria@example.com');
    expect(payload.phonenumber).toBe('540-555-5678');
    expect(payload.country).toBe('United States');
    expect(payload.uSAstate).toBe('Virginia');
    expect(payload.zipcode).toBe('24018');
    expect(payload.comments).toBe('Booking inquiry for acoustic live music event.');
  });

  test('Trap field submission carries bot-entered website value in payload', async ({ page }) => {
    let capturedPayload: IinquiryPayload | null = null;

    await page.route('http://localhost:7000/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/inquiry') {
        capturedPayload = route.request().postDataJSON() as IinquiryPayload;
        // Backend silently drops trap submission with HTTP 200
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

    // Bot populates the hidden trap field
    await page.locator('#website').evaluate((el: HTMLInputElement, val: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, 'https://seo-ranking-services.example.com');

    // Fill the rest of the form
    await page.locator('#firstname').fill('Spam');
    await page.locator('#lastname').fill('Bot');
    await page.locator('#emailaddress').fill('spambot@example.com');
    await page.locator('#phonenumber').fill('555-019-2834');
    await page.locator('#state').selectOption('Virginia');
    await page.locator('#zipcode').fill('24018');
    await page.locator('#eventDate').fill('2026-12-15');
    await page.locator('#eventType').selectOption('private-party');
    await page.locator('#venueAddress').fill('123 Spam Highway, Roanoke, VA 24018');
    await page.getByPlaceholder('* Comments').fill('We offer SEO and ranking services.');

    const sendButton = page.locator('#sendEmailButton');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    await expect(page.getByText('Thank you for contacting us.')).toBeVisible();

    expect(capturedPayload).not.toBeNull();
    const payload = capturedPayload!;
    expect(payload.form).toBe('jam-bookus');
    expect(payload.website).toBe('https://seo-ranking-services.example.com');
    expect(typeof payload.formLoadedAt).toBe('number');
    expect(payload.formLoadedAt).toBeGreaterThan(0);
  });
});
