import faker from 'faker';

class UserMap {
  name: string;

  loc: { lat: number, lng: number };

  constructor() {
    this.name = faker.name.firstName();
    this.loc = {
      lat: parseFloat(faker.address.latitude()),
      lng: parseFloat(faker.address.longitude()),
    };
  }
}

export default UserMap;
