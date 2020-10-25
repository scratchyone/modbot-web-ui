export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface Capability {
  expire: number;
  type: 'reminders';
  user: string;
}
export async function getCapabilityInfo(token: string): Promise<Capability> {
  const res = await fetch(API_URL + '/capabilities/' + token);
  if (res.status === 404) throw new Error((await res.json()).error);
  return await res.json();
}
