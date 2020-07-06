import faker from 'faker';
import { Loc } from './gMapTypes';

export class UserMap {
  name: string;

  loc: Loc;

  constructor() {
    this.name = faker.name.firstName();
    this.loc = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }
}

export default UserMap;
