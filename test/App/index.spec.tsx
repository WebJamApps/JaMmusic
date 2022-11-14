/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App } from 'src/App';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
  it('renders Google Map API when localhost', () => {
    process.env.BackendUrl = 'http://localhost:7000';
    expect('/map').toBeDefined();
  });
});
