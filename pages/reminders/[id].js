import styles from '../../styles/Reminders.module.css';
import { React } from 'react';
import { FaTimes } from 'react-icons/fa';
import formatDistance from 'date-fns/formatDistance';
import classnames from 'classnames';
export default function Reminders() {
  const expiryTime = 1603660815419;
  const reminders = [
    { text: 'Clean room', time: 'in 30 minutes', id: 'dsd' },
    { text: 'Deal with the dog', time: 'in 1 hour', id: '333' },
  ];
  const expired = false;
  return expired ? (
    <div className={styles.background_expired}>
      <div className={styles.expired_card}>
        <div className={styles.expired_text}>This link has expired</div>
      </div>
    </div>
  ) : (
    <div className={styles.background}>
      <div className={styles.wrapper}>
        <div className={styles.header}>Reminders</div>
        <div className={styles.reminders}>
          <div className={styles.reminder}>
            <span className={classnames(styles.reminderText, styles.expiry)}>
              This link will expire{' '}
              {formatDistance(new Date(expiryTime), Date.now(), {
                addSuffix: true,
              }).replace('about ', '')}
            </span>
          </div>
          {reminders.map((reminder) => (
            <div className={styles.reminder} key={reminder.id}>
              <FaTimes className={styles.x} />
              <span>
                <span className={styles.reminderText}>{reminder.text}</span>
                <span className={styles.reminderTime}>{reminder.time}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
