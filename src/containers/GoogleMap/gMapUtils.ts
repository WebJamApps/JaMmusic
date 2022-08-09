import type { Iloc } from './';
import type UMap from './UserMap';
import type CMap from './CompanyMap';

function makeLoc(faker: { address: { latitude: () => string; longitude: () => string; }; }): Iloc {
  return {
    lat: parseFloat(faker.address.latitude()),
    lng: parseFloat(faker.address.longitude()),
  };
}
const limitLat = (obj: UMap | CMap):UMap | CMap => {
  const newObj = obj;
  if (obj.loc.lat > 83) newObj.loc.lat = 83;
  if (obj.loc.lat < -70) newObj.loc.lat = -70;
  return newObj;
};
function limitUserLat(obj: UMap): UMap { return limitLat(obj); }

function limitCompanyLat(obj: CMap): CMap { return limitLat(obj); }

export default { makeLoc, limitUserLat, limitCompanyLat };
