import styles from '../../styles/Reminders.module.css';
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import { Capability, getCapabilityInfo } from '../../components/main';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
function useForceUpdate() {
  console.log('updated');
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}
function Reminder(props): React.ReactElement {
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
    }, 1000);
  }, []);
  return (
    <div className={styles.reminder}>
      <FaTimes className={styles.x} />
      <span>
        <span className={styles.reminderText}>{props.reminder.text}</span>
        <span className={styles.reminderTime}>{formattedTime}</span>
      </span>
    </div>
  );
}
export default function Reminders(): React.ReactElement {
  const router = useRouter();
  const [capInfo, setCapInfo] = useState<Capability | undefined | null>(
    undefined
  );
  const { id } = router.query;
  console.log(id);
  useEffect(
    () =>
      (async () => {
        const res = await getCapabilityInfo(id as string);
        setCapInfo(res);
      })() && null,
    [id]
  );
  const reminders: { text: string; time: number; id: string }[] = [
    { text: 'Clean room', time: 1603577209438, id: 'dsd' },
    { text: 'Deal with the dog', time: 1603576391000, id: '333' },
  ];
  const expired = capInfo === null;
  return expired ? (
    <div className={styles.background_expired}>
      <div className={styles.expired_card}>
        <div className={styles.expired_text}>This link has expired</div>
      </div>
    </div>
  ) : capInfo !== undefined ? (
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
          {reminders.map((reminder) => (
            <Reminder reminder={reminder} key={reminder.id} />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
