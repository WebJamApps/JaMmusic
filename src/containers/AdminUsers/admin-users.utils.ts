import superagent from 'superagent';

export interface IadminUser {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  userStatus?: string;
  privileges?: string[];
  userDetails?: string;
}

const baseUrl = `${process.env.BackendUrl}/admin/user`;

async function listUsers(token: string): Promise<IadminUser[]> {
  const res = await superagent.get(baseUrl).set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
  return res.body as IadminUser[];
}

async function createUser(
  token: string,
  payload: { name: string; email: string; userType?: string; userStatus?: string; privileges?: string[]; userDetails?: string },
): Promise<IadminUser> {
  const res = await superagent.post(baseUrl).set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`).send(payload);
  return res.body as IadminUser;
}

async function updatePrivileges(token: string, userId: string, privileges: string[]): Promise<IadminUser> {
  const res = await superagent.put(`${baseUrl}/${userId}`).set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`).send({ privileges });
  return res.body as IadminUser;
}

async function mintToken(token: string, userId: string): Promise<string> {
  const res = await superagent.post(`${baseUrl}/${userId}/token`).set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`).send({});
  return (res.body as { token: string }).token;
}

async function deleteUser(token: string, userId: string): Promise<void> {
  await superagent.delete(`${baseUrl}/${userId}`).set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
}

export function getAllowedAdminRoles(): string[] {
  return process.env.NODE_ENV === 'production'
    ? ['JaM-admin', 'Developer']
    : ['JaM-admin', 'Developer'];
}

export default {
  listUsers, createUser, updatePrivileges, mintToken, deleteUser, getAllowedAdminRoles,
};
