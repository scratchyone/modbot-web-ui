export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface Capability {
  expire: number;
  type: 'reminders';
  user: string;
}
export async function getCapabilityInfo(token: string): Promise<Capability> {
  const res = await fetch(API_URL + '/capabilities/' + token);
  if (res.status !== 200) throw new Error('Failed');
  return await res.json();
}
