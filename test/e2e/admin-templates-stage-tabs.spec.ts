import { test, expect } from '@playwright/test';

test('Upcoming tab loads its template and intro, or a blank editor for an unconfigured type', async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true,
      error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.com' },
    }));
  });

  await page.route(/\/user\/user-123/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ userType: 'Developer', email: 'admin@example.com' }),
  }));
  await page.route(/maps\.googleapis\.com/, route => route.abort());
  await page.route('http://localhost:7000/template**', async route => {
    if (new URL(route.request().url()).pathname.startsWith('/template/assets/')) {
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { _id: 'cold', type: 'Originals', stage: 'cold', subject: 'Cold subject', bodyHtml: 'Cold body' },
        {
          _id: 'upcoming',
          type: 'Originals',
          stage: 'upcoming',
          subject: 'Upcoming subject',
          introHtml: 'See you on [Next Gig Date]',
          bodyHtml: 'Upcoming body',
          footerPhotoRef: 'mock-photo',
        },
      ]),
    });
  });

  await page.goto('/admin/templates', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('template-subject-input')).toHaveValue('Cold subject');
  const upcoming = page.getByTestId('templates-tab-stage-upcoming');
  await expect(upcoming).toBeVisible();
  await upcoming.click();
  await expect(upcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('templates-tab-stage-cold')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('Upcoming subject');
  await expect(page.getByTestId('template-intro-textarea')).toHaveValue('See you on [Next Gig Date]');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('Upcoming body');
  await expect(page.getByTestId('template-photo-preview')).toBeVisible();

  const intro = page.getByTestId('template-intro-textarea');
  await intro.fill('Intro: ');
  await page.getByTestId('token-chip-[Next Gig Date]').click();
  await expect(intro).toHaveValue('Intro: [Next Gig Date]');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('Upcoming body');
  await page.getByRole('button', { name: 'Revert' }).click();
  await expect(intro).toHaveValue('See you on [Next Gig Date]');
  await page.screenshot({ path: '/tmp/jammusic-1377-upcoming.png', fullPage: true });

  await page.getByTestId('template-type-OnlineForm').click();
  await expect(upcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('');
  await expect(intro).toHaveValue('');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('');
});
