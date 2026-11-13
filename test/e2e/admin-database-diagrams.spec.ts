import { test, expect } from '@playwright/test';

const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
};

const DEVELOPER_AUTH = {
  isAuthenticated: true,
  error: '',
  token: DEV_TOKEN,
  user: {
    userType: 'Developer',
    email: 'josh@web-jam.com',
  },
};

const SAMPLE_DATABASE_DIAGRAM = `erDiagram\n  direction LR
  User {
    string _id
    string name
    string email
  }
  Gig {
    string _id
    string venueId
  }
  User ||--o{ Gig : creates
`;

const SAMPLE_SYSTEM_MAP = `%% Rule: service names and connections only, never an address, a login or a secret.
flowchart TD
  subgraph Apps[Applications]
    Website[Website] --> Backend[Production Backend]
  end
  Backend --> Atlas[(MongoDB Atlas)]
`;

test.describe('AdminDatabase Diagrams E2E', () => {
  test.beforeEach(async ({ page }) => {
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
    await page.route(/\/facebook\//, (route) => route.fulfill({
      headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '[]',
    }));
    await page.route(/accounts\.google\.com/, (route) => route.abort());
    await page.route(/maps\.googleapis\.com/, (route) => route.abort());
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify(DEVELOPER_AUTH.user) });
    });
    await page.route(/\/admin\/backup\/runs/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/tour/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/picture/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/song/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/venue/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('loads the viewer only on the database page and renders both SVGs', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/diagram\/database/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'text/plain', body: SAMPLE_DATABASE_DIAGRAM });
    });

    await page.route(/\/admin\/backup\/diagram\/system/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 200, contentType: 'text/plain', body: SAMPLE_SYSTEM_MAP });
    });

    const viewerRequests: string[] = [];
    page.on('request', (request) => {
      if (/DiagramViewer-.*\.js/.test(request.url())) viewerRequests.push(request.url());
    });
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(viewerRequests).toHaveLength(0);

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('admin-database-page')).toBeVisible();
    await expect(page.getByTestId('admin-database-diagrams')).toBeVisible();

    const dbSvg = page.locator('[data-testid="database-diagram-svg"] svg');
    await expect(dbSvg).toBeVisible({ timeout: 15000 });

    const systemSvg = page.locator('[data-testid="system-map-svg"] svg');
    await expect(systemSvg).toBeVisible({ timeout: 15000 });
    expect(viewerRequests.length).toBeGreaterThan(0);
  });

  test('opens at natural size and supports zoom, pan, Fit, Reset and dark colours', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
      localStorage.setItem('theme', 'light');
    }, DEVELOPER_AUTH);
    // A wide diagram makes Fit exercise shrinking below the library's default minimum.
    const entities = Array.from({ length: 16 }, (_, i) => `Entity${i} {\n string name\n}\nEntity${i} ||--o{ Entity${i + 1} : links`);
    const wideDiagram = `erDiagram\n direction LR\n${entities.join('\n')}`;
    await page.route(/\/admin\/backup\/diagram\/(database|system)/, (route) => route.fulfill({
      headers: { 'access-control-allow-origin': '*' }, status: 200, contentType: 'text/plain',
      body: route.request().url().endsWith('database') ? wideDiagram : SAMPLE_SYSTEM_MAP,
    }));
    await page.goto('/admin/database');
    for (const id of ['database-diagram', 'system-map']) {
      const panel = page.getByTestId(`${id}-container`);
      const svg = panel.locator('svg').last();
      await expect(svg).toBeVisible();
      const content = panel.locator('.react-transform-component');
      const scale = () => content.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
      await expect.poll(scale).toBe(1);
      const dimensions = await svg.evaluate((el) => ({
        width: el.getBoundingClientRect().width, natural: (el as SVGSVGElement).viewBox.baseVal.width,
      }));
      expect(dimensions.width).toBeCloseTo(dimensions.natural, 0);
      await panel.getByRole('button', { name: 'Plus', exact: true }).click();
      await expect.poll(scale).toBeGreaterThan(1);
      const enlargedScale = await scale();
      await panel.getByRole('button', { name: 'Minus', exact: true }).click();
      await expect.poll(scale).toBeLessThan(enlargedScale);
      await panel.getByRole('button', { name: 'Fit', exact: true }).click();
      await expect.poll(scale).not.toBe(1);
      const viewport = panel.locator('.react-transform-wrapper');
      const viewportWidth = await viewport.evaluate((el) => el.clientWidth);
      await expect.poll(() => svg.evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(viewportWidth + 1);
      await panel.getByRole('button', { name: 'Reset', exact: true }).click();
      await expect.poll(scale).toBe(1);
      await viewport.scrollIntoViewIfNeeded();
      await viewport.hover();
      await page.mouse.wheel(0, -150);
      await expect.poll(scale).toBeGreaterThan(1);
      // Wait for the wheel's smooth zoom to finish before starting a new gesture.
      let lastScale = 0;
      let stableSamples = 0;
      await expect.poll(async () => {
        const currentScale = await scale();
        stableSamples = currentScale === lastScale ? stableSamples + 1 : 0;
        lastScale = currentScale;
        return stableSamples;
      }, { intervals: [100] }).toBeGreaterThanOrEqual(3);
      await panel.getByRole('button', { name: 'Reset', exact: true }).click();
      await expect.poll(scale).toBe(1);
      await viewport.scrollIntoViewIfNeeded();
      const position = () => content.evaluate((el) => {
        const matrix = new DOMMatrix(getComputedStyle(el).transform);
        return { x: matrix.e, y: matrix.f };
      });
      const before = await position();
      await viewport.hover({ position: { x: 50, y: 50 } });
      const bounds = await viewport.boundingBox();
      expect(bounds).not.toBeNull();
      await page.mouse.move(bounds!.x + 50, bounds!.y + 50);
      await page.mouse.down();
      await page.mouse.move(bounds!.x + 100, bounds!.y + 100, { steps: 5 });
      await page.mouse.up();
      await expect.poll(position).not.toEqual(before);
    }
    // Switching the site mode redraws both diagrams with Mermaid's dark palette.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('switch', { name: 'Switch to dark mode' }).click();
    for (const id of ['database-diagram-svg', 'system-map-svg']) {
      const diagram = page.getByTestId(id);
      await expect(diagram.locator('svg')).toBeVisible();
      await expect.poll(() => diagram.locator('svg rect').evaluateAll((boxes) => boxes.every((box) => {
        const rgb = getComputedStyle(box).fill.match(/\d+/g)?.map(Number);
        return !rgb || rgb.slice(0, 3).some((channel) => channel <= 220);
      }))).toBe(true);
    }
  });

  test('shows a message in place of a diagram when fetch fails', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/diagram\/database/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
    });

    await page.route(/\/admin\/backup\/diagram\/system/, async (route) => {
      await route.fulfill({
        headers: CORS_HEADERS,
        status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'failed to read system map' }) });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('admin-database-page')).toBeVisible();
    await expect(page.getByTestId('database-diagram-error')).toBeVisible();
    await expect(page.getByTestId('system-map-error')).toBeVisible();

    await expect(page.getByTestId('database-diagram-svg')).toHaveCount(0);
    await expect(page.getByTestId('system-map-svg')).toHaveCount(0);
  });
});
