'use client';
import { useAppStore } from './app-store';

export function Topbar(){
  const { state, selectedBranch, setSelectedBranch } = useAppStore();
  return <header className="topbar">
    <div className="topbar-left">
      <strong style={{fontSize:14}}>{state.settings.name}</strong>
      <select className="branch-select" value={selectedBranch} onChange={e=>setSelectedBranch(e.target.value)} aria-label="Select branch">
        <option value="all">All branches</option>{state.branches.filter(b=>b.active).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <span className="demo-pill">Demo mode</span>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:9}}><div style={{textAlign:'right'}}><div style={{fontSize:12,fontWeight:700}}>Owner</div><div style={{fontSize:11,color:'var(--muted)'}}>Administrator</div></div><div className="avatar">BW</div></div>
  </header>
}
