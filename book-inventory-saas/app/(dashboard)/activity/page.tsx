'use client';
import { useAppStore } from '@/components/app-store';
import { Badge, PageHead } from '@/components/ui';
import { dateTime } from '@/lib/utils';
export default function ActivityPage(){const {state}=useAppStore();return <><PageHead title="Activity Log" subtitle="Chronological history of important actions across inventory and operations."/><section className="card section"><div className="tablewrap"><table className="table"><thead><tr><th>When</th><th>Event</th><th>Details</th><th>Type</th></tr></thead><tbody>{state.activities.map(a=><tr key={a.id}><td>{dateTime(a.date)}</td><td className="strong">{a.message}</td><td>{a.detail}</td><td><Badge>{a.kind}</Badge></td></tr>)}</tbody></table></div></section></>}
