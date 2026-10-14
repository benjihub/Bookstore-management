import { AppStoreProvider } from '@/components/app-store';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }){
  return <AppStoreProvider><div className="shell"><Sidebar/><main className="main"><Topbar/><div className="content">{children}</div></main></div></AppStoreProvider>;
}
