export const API_URL = 'http://localhost:80';
export interface Capability {
  expire: number;
  type: 'reminders';
  user: string;
}
export async function getCapabilityInfo(
  token: string
): Promise<null | Capability> {
  const res = await fetch(API_URL + '/capabilities/' + token);
  if (res.status === 404) return null;
  return await res.json();
}
