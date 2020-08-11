import { Loc } from './gMapTypes';
import type UMap from './UserMap';
import type CMap from './CompanyMap';

function makeLoc(faker: { address: { latitude: () => string; longitude: () => string; }; }): Loc {
  return {
    lat: parseFloat(faker.address.latitude()),
    lng: parseFloat(faker.address.longitude()),
  };
}
function limitUserLat(obj: UMap): UMap {
  const newObj = obj;
  if (obj.loc.lat > 83) newObj.loc.lat = 83;
  if (obj.loc.lat < -70) newObj.loc.lat = -70;
  return newObj;
}

function limitCompanyLat(obj: CMap): CMap {
  const newObj = obj;
  if (obj.loc.lat > 83) newObj.loc.lat = 83;
  if (obj.loc.lat < -70) newObj.loc.lat = -70;
  return newObj;
}

export default { makeLoc, limitUserLat, limitCompanyLat };
