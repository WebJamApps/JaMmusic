import { customFetch } from 'src/lib/fetch.utils';

export const TOP_ADMIN_ROLES = ['JaM-admin', 'Developer'];

export function getAllowedAdminRoles(): string[] {
  return TOP_ADMIN_ROLES;
}

export function getOpenApiUrl(): string {
  return `${process.env.BackendUrl || ''}/openapi.json`;
}

export async function fetchOpenApi(token: string): Promise<Record<string, unknown>> {
  const url = getOpenApiUrl();
  const res = await customFetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

export default {
  TOP_ADMIN_ROLES,
  getAllowedAdminRoles,
  getOpenApiUrl,
  fetchOpenApi,
};
