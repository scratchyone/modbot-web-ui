import styles from '../../styles/Reminders.module.css';
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import Linkify from 'react-linkify';
import {
  API_URL,
  Capability,
  getCapabilityInfo,
  getUser,
  User,
} from '../../components/main';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import useSWR, { mutate } from 'swr';
import Head from 'next/head';
interface Reminder {
  text: string;
  time: number;
  id: string;
}
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}
async function getReminders(
  token: string,
  user: string
): Promise<Array<Reminder>> {
  const res = await fetch(API_URL + '/users/' + user + '/reminders/', {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) throw new Error((await res.json()).error);
  return await res.json();
}
async function deleteReminder(
  token: string,
  user: string,
  id: string
): Promise<Array<Reminder>> {
  const res = await fetch(API_URL + '/users/' + user + '/reminders/' + id, {
    headers: { authorization: `Bearer ${token}` },
    method: 'DELETE',
  });
  if (res.status !== 200) throw new Error((await res.json()).error);
  return await res.json();
}
function Reminder(props: {
  reminder: Reminder;
  id: string;
  user: string;
}): React.ReactElement {
  const forceUpdate = useForceUpdate();
  let formattedTime = formatDistanceToNowStrict(new Date(props.reminder.time), {
    addSuffix: true,
  });
  useEffect(() => {
    setInterval(() => {
      if (
        formatDistanceToNowStrict(new Date(props.reminder.time), {
          addSuffix: true,
        }) !== formattedTime
      ) {
        formattedTime = formatDistanceToNowStrict(
          new Date(props.reminder.time),
          {
            addSuffix: true,
          }
        );
        forceUpdate();
      }
    }, 500);
  }, []);
  return props.reminder.time > Date.now() ? (
    <div className={styles.reminder}>
      <FaTimes
        className={styles.x}
        onClick={async () => {
          mutate(
            `reminders/${props.id}`,
            async (reminders: Reminder[]) =>
              reminders.filter((n) => n.id !== props.reminder.id),
            false
          );
          await deleteReminder(props.id, props.user, props.reminder.id);
          mutate(`reminders/${props.id}`);
        }}
      />
      <span>
        <span className={styles.reminderText}>
          <Linkify>{props.reminder.text}</Linkify>
        </span>
        <span className={styles.reminderTime}>{formattedTime}</span>
      </span>
    </div>
  ) : (
    <div></div>
  );
}
export default function Reminders(props: {
  capInfo: Capability | null;
  reminders: Array<Reminder> | null;
  user: User | null;
  invalid: boolean;
}): React.ReactElement {
  const router = useRouter();
  const id = router.query['id'];
  const { data: capInfo, error: capError } = useSWR(
    id ? `capabilities/${id}` : null,
    async () => await getCapabilityInfo(id as string),
    { initialData: props.capInfo }
  );
  const { data: reminders, error: rmError } = useSWR(
    capInfo ? `reminders/${id}` : null,
    async () => await getReminders(id as string, capInfo?.user || ''),
    { refreshInterval: 2000, initialData: props.reminders }
  );
  const { data: user } = useSWR(
    capInfo ? `users/${id}` : null,
    async () => await getUser(id as string, capInfo?.user || ''),
    { initialData: props.user }
  );
  const expired = capInfo ? !!capError : props.invalid;
  return expired ? (
    <div className={styles.background_expired}>
      <Head>
        <title>Expired Link</title>
        <meta property="og:site_name" content="ModBot" />
        <meta property="og:title" content="Expired Link" />
        <meta content={'Link no longer exists'} property="og:description" />
      </Head>
      <div className={styles.expired_card}>
        <div className={styles.expired_text}>This link has expired</div>
      </div>
    </div>
  ) : capInfo ? (
    <div className={styles.background}>
      <Head>
        <title>{'@' + (user ? user.username : 'User') + "'s Reminders"}</title>
        <meta content="ModBot" property="og:site_name" />
        <meta
          content={'@' + (user ? user.username : 'User')}
          property="profile:username"
        />
        <meta
          content={'@' + (user ? user.username : 'User') + "'s Reminders"}
          property="og:title"
        />
        <meta
          content={
            'View and manage @' +
            (user ? user.username : 'User') +
            "'s Reminders"
          }
          property="og:description"
        />
        <meta
          content={typeof location !== 'undefined' ? location.href : ''}
          property="og:url"
        />
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.header}>Reminders</div>
        <div className={styles.reminders}>
          <div className={styles.reminder}>
            <span className={classnames(styles.reminderText, styles.expiry)}>
              This link will expire{' '}
              {formatDistanceToNow(new Date(capInfo.expire), {
                addSuffix: true,
              }).replace('about ', '')}
            </span>
          </div>
          {rmError && (
            <div className={styles.reminder}>
              <span className={classnames(styles.reminderText, styles.expiry)}>
                Failed to fetch reminders, something is wrong
              </span>
            </div>
          )}
          {reminders &&
            reminders
              .sort((r1, r2) => r1.time - r2.time)
              .map((reminder: Reminder) => (
                <Reminder
                  reminder={reminder}
                  key={reminder.id}
                  id={id as string}
                  user={capInfo.user}
                />
              ))}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
export async function getServerSideProps({
  query,
}: {
  query: {
    id: string;
  };
}): Promise<{
  props: {
    capInfo: Capability | null;
    reminders: Array<Reminder> | null;
    user: User | null;
    invalid: boolean;
  };
}> {
  const id = query['id'];
  let capInfo = null;
  let reminders = null;
  let user = null;
  let invalid = true;
  try {
    capInfo = await getCapabilityInfo(id as string);
    reminders = await getReminders(id as string, capInfo.user);
    user = await getUser(id as string, capInfo.user);
    invalid = false;
  } catch (e) {}
  // Pass data to the page via props
  return { props: { capInfo, reminders, user, invalid } };
}
