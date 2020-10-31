import styles from '../../styles/Admin.module.css';
import React, { useState, useEffect } from 'react';
import { FaCodeBranch, FaPlus, FaTimes } from 'react-icons/fa';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import Linkify from 'react-linkify';
import parse from 'parse-duration';
import TextareaAutosize from 'react-textarea-autosize';
import { API_URL, Capability, getCapabilityInfo } from '../../components/main';
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatDuration,
} from 'date-fns';
import useSWR, { mutate } from 'swr';
import Head from 'next/head';
import { motion } from 'framer-motion';
interface AdminData {
  version: string;
  uptime: number;
  guilds: number;
  users: number;
  commit_short: string;
  commit_msg: string;
}
async function getAdmin(token: string): Promise<AdminData> {
  const res = await fetch(API_URL + '/admin/', {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) throw new Error('Failed');
  return await res.json();
}
async function stop(token: string): Promise<void> {
  const res = await fetch(API_URL + '/admin/stop', {
    headers: { authorization: `Bearer ${token}` },
    method: 'POST',
  });
  if (res.status !== 200) throw new Error('Failed');
}
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}
export default function Admin(): React.ReactElement {
  const router = useRouter();
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    setInterval(() => {
      forceUpdate();
    }, 500);
  }, []);
  const id = router.query['id'];
  const { data: capInfo, error: capError } = useSWR(
    id ? `capabilities/${id}` : null,
    async () => await getCapabilityInfo(id as string),
    { refreshInterval: 2000 }
  );
  const { data: adminInfo } = useSWR(
    id ? `admin/${id}` : null,
    async () => await getAdmin(id as string),
    { refreshInterval: 2000 }
  );
  const expired = capError && capError.toString() === 'Error: 404';
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
      <div className={styles.wrapper}>
        <div className={styles.headerWrapper}>
          <div className={styles.header}>ModBot v{adminInfo?.version}</div>
          <div className={styles.restart} onClick={() => stop(id as string)}>
            Restart
          </div>
        </div>
        <div className={styles.commit}>
          <span className={styles.commitInfo}>
            <FaCodeBranch /> {adminInfo?.commit_short}{' '}
          </span>
          <span className={styles.commitMessage}>{adminInfo?.commit_msg}</span>
        </div>
        <div className={styles.badgesWrapper}>
          <Badge label="Uptime" value={goodifyUptime(adminInfo?.uptime || 0)} />
          <Badge label="Guilds" value={adminInfo?.guilds.toString() || ''} />
          <Badge label="Users" value={adminInfo?.users.toString() || ''} />
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
function goodifyUptime(uptime: number): string {
  uptime = Date.now() / 1000 - uptime;
  const d = formatDuration({
    seconds: Math.round(uptime) % 60,
    minutes: Math.round(uptime / 60) % 60,
    hours: Math.round(uptime / 3600) % 23,
    days: Math.round(uptime / 86400),
  })
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd');
  return d;
}
function Badge(props: { label: string; value: string }): React.ReactElement {
  return (
    <span className={styles.badgeWrapper}>
      <span className={styles.badgeLabel}>{props.label}</span>
      <span className={styles.badgeValue}>{props.value}</span>
    </span>
  );
}
