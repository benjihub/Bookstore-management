import React from 'react';
export function PageHead({title,subtitle,actions}:{title:string;subtitle:string;actions?:React.ReactNode}){return <div className="pagehead"><div><h1>{title}</h1><p>{subtitle}</p></div>{actions&&<div className="actions">{actions}</div>}</div>}
export function KPI({label,value,hint}:{label:string;value:string;hint?:string}){return <div className="card kpi"><div className="label">{label}</div><div className="value">{value}</div>{hint&&<div className="hint">{hint}</div>}</div>}
export function Badge({children,tone='default'}:{children:React.ReactNode;tone?:'default'|'good'|'warn'|'bad'}){return <span className={`badge ${tone==='default'?'':tone}`}>{children}</span>}
