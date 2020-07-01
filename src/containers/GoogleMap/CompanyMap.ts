import faker from 'faker';

class CompanyMap {
  name: string;

  catchPhrase: string;

  loc: { lat: number, lng: number };

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
