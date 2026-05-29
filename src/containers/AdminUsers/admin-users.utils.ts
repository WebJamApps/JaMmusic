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
  const res = await fetch(baseUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IadminUser[];
}

async function createUser(
  token: string,
  payload: { name: string; email: string; userType?: string; userStatus?: string; privileges?: string[]; userDetails?: string },
): Promise<IadminUser> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IadminUser;
}

async function updateUser(token: string, userId: string, payload: { privileges?: string[]; userType?: string }): Promise<IadminUser> {
  const res = await fetch(`${baseUrl}/${userId}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json() as IadminUser;
}

async function mintToken(token: string, userId: string): Promise<string> {
  const res = await fetch(`${baseUrl}/${userId}/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = await res.json() as { token: string };
  return body.token;
}

async function deleteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${userId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export function getAllowedAdminRoles(): string[] {
  return process.env.NODE_ENV === 'production'
    ? ['JaM-admin', 'Developer', 'clc-admin']
    : ['JaM-admin', 'Developer', 'clc-admin'];
}

export default {
  listUsers, createUser, updateUser, mintToken, deleteUser, getAllowedAdminRoles,
};
