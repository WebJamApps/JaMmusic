import faker from 'faker';
import { Loc } from './gMapTypes';

export class CompanyMap {
  name: string;

  catchPhrase: string;

  loc: Loc;

  constructor() {
    this.name = faker.company.companyName();
    this.catchPhrase = faker.company.catchPhrase();
    this.loc = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }
}

export default CompanyMap;
