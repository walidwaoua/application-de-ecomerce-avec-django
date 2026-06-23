'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import './admin.css';

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
      <div className="admin-loading" role="status" aria-label="Chargement">
        <div className="admin-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <style jsx global>{`
        .admin-shell { --admin-navbar-height: 80px; --admin-sidebar-width: 240px; display: flex; align-items: flex-start; min-height: calc(100vh - var(--admin-navbar-height)); background: #151515; color: #f5f5f5; }
        .admin-sidebar { position: sticky; top: var(--admin-navbar-height); z-index: 100; box-sizing: border-box; flex: 0 0 var(--admin-sidebar-width); width: var(--admin-sidebar-width); height: calc(100vh - var(--admin-navbar-height)); display: flex; flex-direction: column; background: #1c1c1c; border-right: 1px solid #303030; }
        .admin-brand { display: flex; align-items: center; gap: 10px; margin: 0; padding: 32px 16px 18px; border-bottom: 1px solid #303030; color: #fafafa; font-size: 14px; font-weight: 700; letter-spacing: -.015em; text-decoration: none; }
        .admin-brand-mark { display: grid; width: 31px; height: 31px; place-items: center; border: 1px solid #555; border-radius: 8px; background: #262626; color: #fff; font-size: 13px; }
        .admin-nav { min-height: 0; flex: 1; overflow-y: auto; padding: 14px 12px; }
        .admin-nav-label { display: block; padding: 10px 10px 8px; color: #777; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .admin-nav-link { display: flex; align-items: center; gap: 11px; margin: 3px 0; padding: 10px; border: 1px solid transparent; border-radius: 7px; color: #b8b8b8; font-size: 13px; font-weight: 600; text-decoration: none; transition: background .15s ease, border-color .15s ease, color .15s ease; }
        .admin-nav-link:hover { background: #292929; color: #fff; text-decoration: none; }
        .admin-nav-link.active { border-color: #444; background: #313131; color: #fff; }
        .admin-nav-icon { width: 17px; color: #979797; text-align: center; font-size: 14px; }
        .admin-nav-link.active .admin-nav-icon { color: #fff; }
        .admin-sidebar-footer { margin: 12px; padding: 13px; border: 1px solid #353535; border-radius: 9px; background: #242424; }
        .admin-profile { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
        .admin-avatar { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border-radius: 50%; background: #4a4a4a; color: #fff; font-size: 12px; font-weight: 800; }
        .admin-username { overflow: hidden; color: #f5f5f5; font-size: 12px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
        .admin-role { margin-top: 2px; color: #969696; font-size: 10px; }
        .admin-store-link { display: flex; align-items: center; gap: 8px; color: #c7c7c7; font-size: 12px; font-weight: 600; text-decoration: none; }
        .admin-store-link:hover { color: #fff; text-decoration: none; }
        .admin-main { min-width: 0; min-height: calc(100vh - var(--admin-navbar-height)); flex: 1; background: #151515; }
        .admin-content { width: 100%; max-width: 1440px; margin: 0 auto; padding: 32px 32px 40px; }
        .admin-loading { display: grid; min-height: calc(100vh - 80px); place-items: center; background: #151515; }
        .admin-loading-spinner { width: 32px; height: 32px; border: 3px solid #444; border-top-color: #fff; border-radius: 50%; animation: admin-spin .75s linear infinite; }
        @keyframes admin-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .admin-shell { --admin-sidebar-width: 70px; } .admin-brand { justify-content: center; margin: 0; padding: 16px 0; } .admin-brand > span:last-child, .admin-nav-label, .admin-nav-link span, .admin-profile > div, .admin-store-link { display: none; } .admin-nav { padding: 12px 10px; } .admin-nav-link { justify-content: center; padding: 12px 0; } .admin-nav-icon { width: auto; } .admin-sidebar-footer { display: grid; place-items: center; padding: 9px; } .admin-profile { margin: 0; } .admin-content { padding: 30px 20px 32px; } }
        @media (max-width: 576px) { .admin-content { padding: 24px 16px 28px; } }
      `}</style>

      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-mark"><i className="fas fa-store" /></span>
          <span>Homyzone Admin</span>
        </Link>

        <nav className="admin-nav" aria-label="Navigation administrateur">
          <span className="admin-nav-label">Administration</span>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`admin-nav-link${active ? ' active' : ''}`}>
                <i className={`${item.icon} admin-nav-icon`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">{username[0]?.toUpperCase()}</div>
            <div>
              <div className="admin-username">{username}</div>
              <div className="admin-role">Administrateur</div>
            </div>
          </div>
          <Link href="/" className="admin-store-link">
            <i className="fas fa-arrow-left" /> Retour boutique
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
