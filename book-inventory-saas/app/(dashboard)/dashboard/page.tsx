'use client';
import { useAppStore } from '@/components/app-store';
import { KPI, PageHead, Badge } from '@/components/ui';
import { money, dateTime } from '@/lib/utils';

export default function Dashboard(){
  const {state,selectedBranch}=useAppStore();
  const inv=state.inventory.filter(i=>selectedBranch==='all'||i.branchId===selectedBranch);
  const sales=state.sales.filter(s=>!s.reversed&&(selectedBranch==='all'||s.branchId===selectedBranch));
  const expenses=state.expenses.filter(e=>selectedBranch==='all'||e.branchId===selectedBranch);
  const totalCopies=inv.reduce((a,b)=>a+b.quantity,0);
  const inventoryValue=inv.reduce((sum,row)=>sum+row.quantity*(state.books.find(b=>b.id===row.bookId)?.costPrice||0),0);
  const revenue=sales.reduce((a,b)=>a+b.total,0);
  const cogs=sales.reduce((sum,s)=>sum+s.items.reduce((a,i)=>a+i.quantity*i.unitCost,0),0);
  const gross=revenue-cogs;
  const expenseTotal=expenses.reduce((a,b)=>a+b.amount,0);
  const low=inv.filter(i=>i.quantity<=((state.books.find(b=>b.id===i.bookId)?.reorderLevel)||state.settings.lowStockDefault)).length;
  const salesByBook = state.books.map(book=>({book,qty:sales.reduce((n,s)=>n+s.items.filter(i=>i.bookId===book.id).reduce((a,i)=>a+i.quantity,0),0)})).sort((a,b)=>b.qty-a.qty).slice(0,5);
  const max=Math.max(1,...salesByBook.map(x=>x.qty));
  return <>
    <PageHead title="Dashboard" subtitle="A live view of stock, sales and bookstore performance."/>
    <div className="grid kpis"><KPI label="Revenue" value={money(revenue,state.settings.currency)} hint="Completed sales in demo history"/><KPI label="Gross profit" value={money(gross,state.settings.currency)} hint={`Before expenses · ${money(expenseTotal,state.settings.currency)} expenses`}/><KPI label="Inventory value" value={money(inventoryValue,state.settings.currency)} hint={`${totalCopies.toLocaleString()} copies on hand`}/><KPI label="Low-stock lines" value={String(low)} hint="At or below reorder level"/></div>
    <div className="split">
      <section className="card section"><h2>Best-selling titles</h2>{salesByBook.map(x=><div className="barrow" key={x.book.id}><span>{x.book.title}</span><div className="bar"><span style={{width:`${(x.qty/max)*100}%`}}/></div><strong>{x.qty}</strong></div>)}</section>
      <section className="card section"><h2>Recent activity</h2>{state.activities.slice(0,6).map(a=><div className="activity" key={a.id}><div className="dot"/><div><strong>{a.message}</strong><span>{a.detail}</span><span>{dateTime(a.date)}</span></div></div>)}</section>
    </div>
    <section className="card section" style={{marginTop:16}}><h2>Stock attention</h2><div className="tablewrap"><table className="table"><thead><tr><th>Book</th><th>Branch</th><th>On hand</th><th>Reorder level</th><th>Status</th></tr></thead><tbody>{inv.map(i=>{const b=state.books.find(x=>x.id===i.bookId);const br=state.branches.find(x=>x.id===i.branchId);if(!b)return null;const tone=i.quantity===0?'bad':i.quantity<=b.reorderLevel?'warn':'good';return <tr key={`${i.bookId}-${i.branchId}`}><td><span className="strong">{b.title}</span><div className="muted">{b.sku}</div></td><td>{br?.name}</td><td>{i.quantity}</td><td>{b.reorderLevel}</td><td><Badge tone={tone}>{i.quantity===0?'Out of stock':i.quantity<=b.reorderLevel?'Low stock':'Healthy'}</Badge></td></tr>})}</tbody></table></div></section>
  </>
}
