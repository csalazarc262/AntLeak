import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Ant SVG — same as HTML reference */
function AntIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5aba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="2.2"/>
      <ellipse cx="12" cy="12" rx="2" ry="2.5"/>
      <ellipse cx="12" cy="18" rx="2.3" ry="2.8"/>
      <path d="M10 6.5 L6 4 M14 6.5 L18 4"/>
      <path d="M9.5 12 L5 11 M14.5 12 L19 11"/>
      <path d="M10 18 L5 20 M14 18 L19 20"/>
    </svg>
  );
}

/* Nav SVG icons */
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>
  </svg>
);
const IconTips = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <path d="M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const navItemBase = {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '12px 14px', borderRadius: '12px',
  fontSize: '14px', fontWeight: '500',
  cursor: 'pointer', transition: 'all 0.2s ease',
  textDecoration: 'none', color: 'rgba(250,246,237,0.75)',
};
const navItemActive = { background: '#7bd191', color: '#2b2a26' };
const navItemHover = { background: 'rgba(250,246,237,0.08)', color: '#faf6ed' };

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??';

  const sidebarStyle = {
    background: '#2b2a26',
    padding: '32px 20px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: '#faf6ed',
    width: '260px',
    flexShrink: 0,
  };

  const NavItem = ({ to, icon: Icon, label, end: isEnd }) => (
    <NavLink to={to} end={isEnd} onClick={onClose} style={({ isActive }) => ({ ...navItemBase, ...(isActive ? navItemActive : {}) })}
      onMouseEnter={e => { if (!e.currentTarget.style.background.includes('7bd')) { e.currentTarget.style.background = 'rgba(250,246,237,0.08)'; e.currentTarget.style.color = '#faf6ed'; } }}
      onMouseLeave={e => { if (!e.currentTarget.style.background.includes('7bd')) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(250,246,237,0.75)'; } }}
    >
      <Icon />{label}
    </NavLink>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(250,246,237,0.4)', padding: '0 14px', marginTop: '14px', marginBottom: '4px', fontFamily: 'Fraunces, serif' }}>
      {children}
    </div>
  );

  const content = (
    <div style={sidebarStyle}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ width: '44px', height: '44px', background: '#faf6ed', borderRadius: '14px', display: 'grid', placeItems: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', flexShrink: 0 }}>
          <AntIcon />
        </div>
        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '20px', fontStyle: 'italic', color: '#faf6ed', letterSpacing: '-0.01em' }}>
          AntLeak
        </span>
        {isOpen !== undefined && (
          <button onClick={onClose} className="lg:hidden ml-auto" style={{ background: 'none', border: 'none', color: 'rgba(250,246,237,0.5)', cursor: 'pointer', padding: '4px' }}>
            <IconX />
          </button>
        )}
      </div>

      {/* Nav */}
      <SectionLabel>Menú</SectionLabel>
      <NavItem to="/dashboard" icon={IconDashboard} label="Panel" end />
      {user?.role !== 'admin' && <NavItem to="/dashboard/nuevo-gasto" icon={IconPlus} label="Nuevo Gasto" />}
      {user?.role !== 'admin' && <NavItem to="/dashboard/historial" icon={IconHistory} label="Historial" />}
      <NavItem to="/dashboard/perfil" icon={IconUser} label="Mi Perfil" />
      <NavItem to="/dashboard/consejos" icon={IconTips} label="Consejos" />

      {user?.role === 'admin' && (
        <>
          <SectionLabel>Admin</SectionLabel>
          <NavItem to="/dashboard/usuarios" icon={IconUsers} label="Usuarios" />
          <NavItem to="/dashboard/resumen" icon={IconChart} label="Resumen App" />
        </>
      )}

      {/* Logout */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleLogout}
          style={{ ...navItemBase, width: '100%', border: 'none', background: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(250,246,237,0.08)'; e.currentTarget.style.color = '#faf6ed'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(250,246,237,0.75)'; }}
        >
          <IconLogout />Cerrar sesión
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(250,246,237,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#d4ad7d', display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontWeight: '600', color: '#2b2a26', flexShrink: 0, fontSize: '15px' }}>
          {initials}
        </div>
        <div style={{ fontSize: '13px', minWidth: 0 }}>
          <div style={{ color: '#faf6ed', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
          <div style={{ color: 'rgba(250,246,237,0.5)', fontSize: '12px' }}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(43,42,38,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      )}

      {/* Desktop: static */}
      <div className="hidden lg:flex h-screen flex-shrink-0">{content}</div>

      {/* Mobile: slide-in */}
      <div
        className="fixed top-0 left-0 z-50 lg:hidden h-full"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}
      >
        {content}
      </div>
    </>
  );
}
