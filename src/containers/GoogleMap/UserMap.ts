import faker from 'faker';
import type { Iloc } from '.';
import gMapUtils from './gMapUtils';

export class UserMap {
  name: string;

  loc: Iloc;

  constructor() {
    this.name = faker.name.firstName();
    this.loc = gMapUtils.makeLoc(faker);
  }
}

export default UserMap;
