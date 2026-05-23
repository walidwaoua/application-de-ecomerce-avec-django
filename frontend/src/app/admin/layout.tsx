'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { href: '/admin/products', label: 'Produits', icon: 'fas fa-box-open' },
  { href: '/admin/orders', label: 'Commandes', icon: 'fas fa-shopping-bag' },
  { href: '/admin/users', label: 'Utilisateurs', icon: 'fas fa-users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    getCurrentUser().then(res => {
      if (!res?.user?.is_staff) {
        router.replace('/');
      } else {
        setUsername(res.user.username);
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '56px' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', minHeight: '100%', background: '#1a1d2e',
        position: 'fixed', top: '56px', left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', zIndex: 100,
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #2d3250' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              {username[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{username}</div>
              <div style={{ color: '#7c83a0', fontSize: 11 }}>Administrateur</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', textDecoration: 'none',
                color: active ? '#fff' : '#9aa3bf',
                background: active ? 'linear-gradient(90deg,#6366f1,#4f46e5)' : 'transparent',
                borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all .15s',
              }}>
                <i className={item.icon} style={{ width: 18, textAlign: 'center' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #2d3250' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            color: '#9aa3bf', textDecoration: 'none', fontSize: 13,
          }}>
            <i className="fas fa-arrow-left" />
            Retour boutique
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, background: '#f1f5f9', minHeight: '100%' }}>
        <div style={{ padding: '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
