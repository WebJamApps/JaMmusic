import { Loc } from './gMapTypes';

export interface IgMapUtils {
  makeLoc: any; limitLat: any
}
function makeLoc(faker: any): Loc {
  return {
    lat: parseFloat(faker.address.latitude()),
    lng: parseFloat(faker.address.longitude()),
  };
}
function limitLat(obj: any): any {
  const newObj = obj;
  if (obj.loc.lat > 83) newObj.loc.lat = 83;
  if (obj.loc.lat < -70) newObj.loc.lat = -70;
  return newObj;
}

export default { makeLoc, limitLat };
