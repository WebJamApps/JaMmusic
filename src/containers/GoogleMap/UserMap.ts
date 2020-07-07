import faker from 'faker';
import { Loc } from './gMapTypes';
import gMapUtils from './gMapUtils';

export class UserMap {
  name: string;

  loc: Loc;

  constructor() {
    this.name = faker.name.firstName();
    this.loc = gMapUtils.makeLoc(faker);
  }
}

export default UserMap;
