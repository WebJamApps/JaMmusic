import faker from 'faker';
import type { Iloc } from '.';
import gMapUtils from './gMapUtils';

export class CompanyMap {
  name: string;

  catchPhrase?: string;

  loc: Iloc;

  constructor() {
    this.name = faker.company.companyName();
    this.catchPhrase = faker.company.catchPhrase();
    this.loc = gMapUtils.makeLoc(faker);
  }
}

export default CompanyMap;
