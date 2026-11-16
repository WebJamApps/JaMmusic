import { test, expect } from '@playwright/test';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};

test('Stage tabs load templates, or blank editors for unconfigured types', async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('auth', JSON.stringify({
      isAuthenticated: true,
      error: '',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
      user: { userType: 'Developer', email: 'admin@example.com' },
    }));
  });

  await page.routeWebSocket(/.*/, (socket) => {
    socket.onMessage((message) => {
      if (typeof message !== 'string' || !message.startsWith('{')) return;
      const packet = JSON.parse(message) as { event?: string; cid?: number };
      if (packet.event === '#handshake') {
        socket.send(JSON.stringify({ rid: packet.cid, data: { id: 'fixture', pingTimeout: 20000, isAuthenticated: false } }));
      } else if (packet.event === '#subscribe') {
        socket.send(JSON.stringify({ rid: packet.cid }));
      } else if (packet.event === 'initial message') {
        socket.send(JSON.stringify({ event: 'allGigs', data: [] }));
        socket.send(JSON.stringify({ event: 'allPics', data: [] }));
      }
    });
  });
  await page.route(/accounts\.google\.com/, route => route.abort());
  await page.route(/\/facebook\//, route => route.fulfill({ headers: CORS_HEADERS, contentType: 'application/json', body: '[]' }));
  await page.route(/\/tour/, route => route.fulfill({ headers: CORS_HEADERS, status: 200, contentType: 'application/json', body: '[]' }));
  await page.route(/\/song/, route => route.fulfill({ headers: CORS_HEADERS, status: 200, contentType: 'application/json', body: '[]' }));
  await page.route(/\/user\/user-123/, route => route.fulfill({
    headers: CORS_HEADERS,
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ userType: 'Developer', email: 'admin@example.com' }),
  }));
  await page.route(/maps\.googleapis\.com/, route => route.abort());
  await page.route('http://localhost:7000/template**', async route => {
    if (new URL(route.request().url()).pathname.startsWith('/template/assets/')) {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      });
      return;
    }
    await route.fulfill({
      headers: CORS_HEADERS,
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
        {
          _id: 'second-pitch',
          type: 'Originals',
          stage: 'second-pitch',
          subject: 'Second pitch subject',
          bodyHtml: 'Following up from our previous pitch',
        },
        {
          _id: 'second-pitch-returning',
          type: 'Originals',
          stage: 'second-pitch-returning',
          subject: 'Second pitch returning subject',
          introHtml: 'Loved playing for you before',
          bodyHtml: 'Following up for our return visit',
        },
        {
          _id: 'second-pitch-upcoming',
          type: 'Originals',
          stage: 'second-pitch-upcoming',
          subject: 'Second pitch upcoming subject',
          introHtml: 'Looking forward to [Next Gig Date]',
          bodyHtml: 'Following up ahead of our booked show',
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
  await expect(page.getByTestId('templates-tab-stage-second-pitch')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-second-pitch-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-second-pitch-upcoming')).toHaveAttribute('aria-selected', 'false');
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

  await page.getByTestId('template-type-OnlineForm').click();
  await expect(upcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('');
  await expect(intro).toHaveValue('');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('');

  const secondPitch = page.getByTestId('templates-tab-stage-second-pitch');
  await expect(secondPitch).toBeVisible();
  await secondPitch.click();
  await expect(secondPitch).toHaveAttribute('aria-selected', 'true');
  await expect(upcoming).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-cold')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-second-pitch-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-second-pitch-upcoming')).toHaveAttribute('aria-selected', 'false');

  // OnlineForm is unconfigured for second-pitch
  await expect(page.getByTestId('template-subject-input')).toHaveValue('');
  await expect(intro).toHaveValue('');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('');

  // Switch to configured Originals type
  await page.getByTestId('template-type-Originals').click();
  await expect(secondPitch).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('Second pitch subject');
  await expect(page.getByTestId('template-body-textarea')).toHaveValue('Following up from our previous pitch');

  const body = page.getByTestId('template-body-textarea');
  await body.fill('Second pitch: ');
  await page.getByTestId('token-chip-[First Pitch Date]').click();
  await expect(body).toHaveValue('Second pitch: [First Pitch Date]');
  await page.getByRole('button', { name: 'Revert' }).click();
  await expect(body).toHaveValue('Following up from our previous pitch');

  const secondPitchReturning = page.getByTestId('templates-tab-stage-second-pitch-returning');
  await secondPitchReturning.click();
  await expect(secondPitchReturning).toBeVisible();
  await expect(secondPitchReturning).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('templates-tab-stage-cold')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(upcoming).toHaveAttribute('aria-selected', 'false');
  await expect(secondPitch).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-second-pitch-upcoming')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('Second pitch returning subject');
  await expect(intro).toHaveValue('Loved playing for you before');
  await expect(body).toHaveValue('Following up for our return visit');

  await body.fill('Returning follow-up: ');
  await page.getByTestId('token-chip-[First Pitch Date]').click();
  await expect(body).toHaveValue('Returning follow-up: [First Pitch Date]');
  await page.getByRole('button', { name: 'Revert' }).click();
  await expect(body).toHaveValue('Following up for our return visit');

  await page.getByTestId('template-type-OnlineForm').click();
  await expect(page.getByTestId('template-subject-input')).toHaveValue('');
  await expect(intro).toHaveValue('');
  await expect(body).toHaveValue('');

  const secondPitchUpcoming = page.getByTestId('templates-tab-stage-second-pitch-upcoming');
  await secondPitchUpcoming.click();
  await expect(secondPitchUpcoming).toBeVisible();
  await expect(secondPitchUpcoming).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('templates-tab-stage-cold')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('templates-tab-stage-returning')).toHaveAttribute('aria-selected', 'false');
  await expect(upcoming).toHaveAttribute('aria-selected', 'false');
  await expect(secondPitch).toHaveAttribute('aria-selected', 'false');
  await expect(secondPitchReturning).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('template-subject-input')).toHaveValue('');
  await expect(intro).toHaveValue('');
  await expect(body).toHaveValue('');

  await page.getByTestId('template-type-Originals').click();
  await expect(page.getByTestId('template-subject-input')).toHaveValue('Second pitch upcoming subject');
  await expect(intro).toHaveValue('Looking forward to [Next Gig Date]');
  await expect(body).toHaveValue('Following up ahead of our booked show');

  await intro.fill('Upcoming follow-up: ');
  await page.getByTestId('token-chip-[Next Gig Date]').click();
  await expect(intro).toHaveValue('Upcoming follow-up: [Next Gig Date]');
  await page.getByRole('button', { name: 'Revert' }).click();
  await expect(intro).toHaveValue('Looking forward to [Next Gig Date]');
});
