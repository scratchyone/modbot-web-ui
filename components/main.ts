export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface Capability {
  expire: number;
  type: 'reminders';
  user: string;
}
export interface User {
  id: string;
  tag: string;
  avatar: string;
  username: string;
}
export async function getCapabilityInfo(token: string): Promise<Capability> {
  const res = await fetch(API_URL + '/capabilities/' + token);
  if (res.status !== 200) throw new Error(res.status.toString());
  return await res.json();
}
export async function getUser(token: string, user: string): Promise<User> {
  const res = await fetch(API_URL + '/users/' + user, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) throw new Error((await res.json()).error);
  return await res.json();
}
