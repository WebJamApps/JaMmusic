/* eslint-disable @typescript-eslint/no-explicit-any */
import gMapUtils from '../../../src/containers/GoogleMap/gMapUtils';

describe('gMapUtils', () => {
  it('limits user latitude when > 83', () => {
    const userMap: any = { loc: { lat: 84, lng: -80 } };
    const result = gMapUtils.limitUserLat(userMap);
    expect(result.loc.lat).toBe(83);
  });
  it('limits user latitude when < -70', () => {
    const userMap: any = { loc: { lat: -80, lng: -80 } };
    const result = gMapUtils.limitUserLat(userMap);
    expect(result.loc.lat).toBe(-70);
  });
  it('limits company latitude when > 83', () => {
    const cMap: any = { loc: { lat: 84, lng: -80 } };
    const result = gMapUtils.limitCompanyLat(cMap);
    expect(result.loc.lat).toBe(83);
  });
  it('limits company latitude when < -70', () => {
    const cMap: any = { loc: { lat: -80, lng: -80 } };
    const result = gMapUtils.limitCompanyLat(cMap);
    expect(result.loc.lat).toBe(-70);
  });
});
