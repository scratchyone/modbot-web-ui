import styles from '../../styles/Reminders.module.css';
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import { API_URL, getCapabilityInfo } from '../../components/main';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import useSWR, { mutate } from 'swr';
interface Reminder {
  text: string;
  time: number;
  id: string;
}
function useForceUpdate() {
  console.log('updated');
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}
async function getReminders(
  token: string,
  user: string
): Promise<Array<Reminder>> {
  const res = await fetch(API_URL + '/' + user + '/reminders/', {
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
  const res = await fetch(API_URL + '/' + user + '/reminders/' + id, {
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
        <span className={styles.reminderText}>{props.reminder.text}</span>
        <span className={styles.reminderTime}>{formattedTime}</span>
      </span>
    </div>
  ) : (
    <div></div>
  );
}
export default function Reminders(): React.ReactElement {
  const router = useRouter();
  const id = router.query['id'];
  const { data: capInfo, error: capError } = useSWR(
    `capabilities/${id}`,
    async () => await getCapabilityInfo(id as string)
  );
  console.log(capError);
  console.log(capInfo);
  const { data: reminders, error: rmError } = useSWR(
    capInfo ? `reminders/${id}` : null,
    async () => await getReminders(id as string, capInfo?.user || ''),
    { refreshInterval: 2000 }
  );
  const expired = !!capError;
  return expired ? (
    <div className={styles.background_expired}>
      <div className={styles.expired_card}>
        <div className={styles.expired_text}>This link has expired</div>
      </div>
    </div>
  ) : capInfo ? (
    <div className={styles.background}>
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
            reminders.map((reminder) => (
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
