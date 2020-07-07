import faker from 'faker';
import { Loc } from './gMapTypes';
import gMapUtils from './gMapUtils';

export class CompanyMap {
  name: string;

  catchPhrase: string;

  loc: Loc;

  constructor() {
    this.name = faker.company.companyName();
    this.catchPhrase = faker.company.catchPhrase();
    this.loc = gMapUtils.makeLoc(faker);
  }
}

export default CompanyMap;
