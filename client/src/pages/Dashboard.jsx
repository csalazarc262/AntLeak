import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/client';
import { CAT_MAP, CatIcons } from '../constants/categories';

/* Mobile menu icon */
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#faf6ed' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <header className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '60px', background: '#2b2a26', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '20px', color: '#faf6ed' }}>Pequeño hoy · Grande mañana</span>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto' }} className="main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


function formatCRC(v) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v ?? 0);
}

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/expenses').then(({ data }) => setExpenses(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
  const dayLabel = now.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
  const monthName = now.toLocaleDateString('es-CR', { month: 'long' });
  const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const thisMonth = useMemo(() => expenses.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [expenses]);

  const totalMonth = useMemo(() => thisMonth.reduce((s, e) => s + parseFloat(e.amount), 0), [thisMonth]);
  const dailyAvg = now.getDate() > 0 ? totalMonth / now.getDate() : 0;

  const recent = expenses.slice(0, 5);

  const catTotals = useMemo(() => {
    const map = {};
    thisMonth.forEach(e => { map[e.category] = (map[e.category] || 0) + parseFloat(e.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [thisMonth]);
  const maxCat = catTotals[0]?.[1] || 1;

  /* ---- Option cards ---- */
  const optionCards = [
    ...( user?.role !== 'admin' ? [{
      key: 'gasto', cls: 'c1', accent: '#7bd191',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      ),
      title: 'Registrar gasto',
      desc: 'Anota ese cafecito, la propina o el antojo de media tarde en segundos.',
      cta: 'Empezar',
      to: '/dashboard/nuevo-gasto',
    },
    {
      key: 'historial', cls: 'c2', accent: '#d4ad7d',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
      ),
      title: 'Ver historial',
      desc: 'Descubre patrones, categorías con más gasto y tu evolución mensual.',
      cta: 'Explorar',
      to: '/dashboard/historial',
    }] : []),
    {
      key: 'perfil', cls: 'c3', accent: '#a8e0b5',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ),
      title: 'Mi perfil',
      desc: 'Gestiona tu información, email y contraseña de acceso seguro.',
      cta: 'Configurar',
      to: '/dashboard/perfil',
    },
    ...(user?.role === 'admin' ? [
      {
        key: 'admin', accent: '#e8c8a0',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        title: 'Gestión usuarios',
        desc: 'Administra cuentas, roles y accesos del sistema.',
        cta: 'Gestionar',
        to: '/dashboard/usuarios',
      },
      {
        key: 'resumen', accent: '#7bd191',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>,
        title: 'Resumen App',
        desc: 'Estadísticas globales, distribución de usuarios y gastos del sistema.',
        cta: 'Ver resumen',
        to: '/dashboard/resumen',
      },
      {
        key: 'consejos-admin', accent: '#a8e0b5',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
        title: 'Consejos',
        desc: 'Aprende qué es un gasto hormiga, cómo identificarlos y cómo erradicarlos.',
        cta: 'Aprender',
        to: '/dashboard/consejos',
      },
    ] : [
      {
        key: 'consejos', accent: '#e8c8a0',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
        title: 'Consejos',
        desc: 'Aprende qué es un gasto hormiga, cómo identificarlos y cómo erradicarlos.',
        cta: 'Aprender',
        to: '/dashboard/consejos',
      },
    ]),
  ];

  const ArrowIcon = () => (
    <svg className="option-arrow-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );

  return (
    <div>
      {/* ── Topbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#b8905c', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>
            ✦ {dayLabel}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            {greeting},{' '}
            <em style={{ fontStyle: 'italic', color: '#5aba74' }}>{user?.username}</em>.
          </h1>
        </div>
        {user?.role !== 'admin' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard/historial')}
              style={{ padding: '11px 18px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: '#2b2a26', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f2ecdc'; e.currentTarget.style.borderColor = '#d4ad7d'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e8e1cf'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Este mes
            </button>
            <button
              onClick={() => navigate('/dashboard/nuevo-gasto')}
              style={{ padding: '11px 20px', background: '#7bd191', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#2b2a26', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(123,209,145,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5aba74'; e.currentTarget.style.color = '#faf6ed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#7bd191'; e.currentTarget.style.color = '#2b2a26'; e.currentTarget.style.transform = ''; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Nuevo gasto
            </button>
          </div>
        )}
      </div>

      {/* ── Stats banner ── */}
      <div className="stats-grid" style={{
        background: 'linear-gradient(135deg, #7bd191 0%, #86d69c 100%)',
        borderRadius: '24px',
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: '32px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -20px rgba(90,186,116,0.25)',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', background: '#d4ad7d', borderRadius: '50%', opacity: 0.3, filter: 'blur(30px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>
            Gastos acumulados · {monthNameCap}
          </div>
          {loading ? (
            <div style={{ width: '160px', height: '52px', background: 'rgba(43,42,38,0.1)', borderRadius: '12px' }} />
          ) : (
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '52px', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: '#2b2a26' }}>
              {formatCRC(totalMonth)}
            </div>
          )}
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#2b2a26', fontWeight: 500 }}>
            <span style={{ display: 'inline-block', background: 'rgba(43,42,38,0.12)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
              {thisMonth.length} gastos este mes
            </span>
          </div>
        </div>
        <div className="stats-mini-border" style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid rgba(43,42,38,0.15)', paddingLeft: '28px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>Promedio diario</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 500, color: '#2b2a26', letterSpacing: '-0.02em' }}>
            {loading ? '—' : formatCRC(dailyAvg)}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(43,42,38,0.65)', marginTop: '4px' }}>en los últimos {now.getDate()} días</div>
        </div>
        <div className="stats-mini-border" style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid rgba(43,42,38,0.15)', paddingLeft: '28px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>Total registrado</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 500, color: '#2b2a26', letterSpacing: '-0.02em' }}>
            {loading ? '—' : expenses.length}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(43,42,38,0.65)', marginTop: '4px' }}>gastos históricos</div>
        </div>
      </div>

      {/* ── Section title ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 500, letterSpacing: '-0.02em' }}>¿Qué vas a hacer hoy?</h2>
      </div>

      {/* ── Option cards grid ── */}
      <div className="option-grid-r" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '48px' }}>
        {optionCards.map(({ key, accent, icon, title, desc, cta, to }) => (
          <div
            key={key}
            className="option-card"
            onClick={() => navigate(to)}
            style={{
              background: '#faf6ed',
              border: '1.5px solid #e8e1cf',
              borderRadius: '20px',
              padding: '26px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: '210px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e1cf'; }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: accent, display: 'grid', placeItems: 'center', color: '#2b2a26' }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.1, marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '13.5px', color: '#5c5a52', lineHeight: 1.55 }}>{desc}</p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2b2a26' }}>
              {cta}
              <ArrowIcon />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="bottom-grid-r" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '18px', marginBottom: '40px' }}>
        {/* Recent expenses */}
        <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.015em' }}>Últimos gastos</h3>
            <span onClick={() => navigate('/dashboard/historial')} style={{ fontSize: '12px', color: '#b8905c', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'Fraunces, serif' }}>
              Ver todos →
            </span>
          </div>
          {loading ? (
            <div style={{ color: '#9a958a', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Cargando...</div>
          ) : recent.length === 0 ? (
            <div style={{ color: '#9a958a', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No hay gastos aún.</div>
          ) : recent.map((exp) => {
            const cat = CAT_MAP[exp.category] ?? { label: exp.category };
            return (
              <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '14px', alignItems: 'center', padding: '14px 0', borderBottom: '1px dashed #e8e1cf' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f2ecdc', display: 'grid', placeItems: 'center', color: '#b8905c' }}>
                  {CatIcons[exp.category]}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{cat.label}{exp.description ? ` · ${exp.description}` : ''}</div>
                  <div style={{ fontSize: '12px', color: '#9a958a' }}>{new Date(exp.date + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 500, color: '#c96b5a' }}>
                  − {formatCRC(exp.amount)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Category bars */}
        <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.015em' }}>Por categoría</h3>
            <span style={{ fontSize: '12px', color: '#9a958a' }}>{monthNameCap}</span>
          </div>
          {loading ? (
            <div style={{ color: '#9a958a', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Cargando...</div>
          ) : catTotals.length === 0 ? (
            <div style={{ color: '#9a958a', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Sin gastos este mes.</div>
          ) : catTotals.map(([cat, amt]) => {
            const info = CAT_MAP[cat] ?? { label: cat, color: '#9a958a' };
            const pct = Math.round((amt / maxCat) * 100);
            return (
              <div key={cat} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ color: '#b8905c' }}>{CatIcons[cat]}</span>{info.label}
                  </span>
                  <span style={{ color: '#5c5a52', fontFamily: 'Fraunces, serif' }}>{formatCRC(amt)}</span>
                </div>
                <div style={{ height: '8px', background: '#f2ecdc', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '20px', background: info.color, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
