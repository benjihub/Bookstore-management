'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, BookOpen, Boxes, Building2, LayoutDashboard, PackagePlus, ReceiptText, Settings, ShoppingCart, Truck, Users, UserRound, WalletCards, ShieldCheck } from 'lucide-react';

const groups = [
  { label: 'Workspace', items: [
    ['/dashboard','Dashboard',LayoutDashboard], ['/books','Books',BookOpen], ['/inventory','Inventory',Boxes], ['/sales','Sales / POS',ShoppingCart], ['/purchases','Purchases',PackagePlus], ['/transfers','Stock Transfers',Truck]
  ]},
  { label: 'Business', items: [
    ['/suppliers','Suppliers',Building2], ['/customers','Customers',UserRound], ['/expenses','Expenses',WalletCards], ['/reports','Reports',BarChart3]
  ]},
  { label: 'Administration', items: [
    ['/staff','Staff & Roles',Users], ['/activity','Activity Log',Activity], ['/settings','Settings',Settings], ['/admin','Platform Admin',ShieldCheck]
  ]}
] as const;

export function Sidebar(){
  const path = usePathname();
  return <aside className="sidebar">
    <div className="brand"><div className="brandmark">BS</div><div><strong>BookStock</strong><span>Bookstore OS</span></div></div>
    {groups.map(g => <div key={g.label}><div className="navlabel">{g.label}</div><nav className="nav">{g.items.map(([href,label,Icon]) => <Link key={href} href={href} className={path===href?'active':''}><Icon/>{label}</Link>)}</nav></div>)}
  </aside>
}
