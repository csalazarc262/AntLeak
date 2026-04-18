import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/client';

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

export default function Login() {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '16px 18px',
    background: '#f2ecdc',
    border: '1.5px solid transparent',
    borderRadius: '14px',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#2b2a26',
    transition: 'all 0.25s ease',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>

      {/* ── Left art panel ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, #86d69c 0%, #7bd191 45%, #6bc582 100%)',
        overflow: 'hidden',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: '380px', height: '380px', background: '#d4ad7d', top: '-80px', right: '-120px', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#faf6ed', bottom: '-100px', left: '-80px', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', background: '#a8e0b5', top: '40%', left: '20%', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: '#faf6ed', borderRadius: '14px', display: 'grid', placeItems: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
            <AntIcon />
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '22px', fontStyle: 'italic', color: '#faf6ed', letterSpacing: '-0.01em' }}>
            AntLeak
          </span>
        </div>

        {/* Main headline */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px' }}>
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(42px, 5vw, 68px)',
            fontWeight: 400,
            lineHeight: 0.98,
            color: '#faf6ed',
            letterSpacing: '-0.03em',
            marginBottom: '24px',
          }}>
            Los pequeños gastos{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#d4ad7d' }}>
              suman grandes historias.
            </em>
          </h1>
          <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'rgba(250,246,237,0.9)', maxWidth: '420px' }}>
            Registra cada café, cada antojo, cada propina. AntLeak convierte tus gastos invisibles en decisiones conscientes.
          </p>
        </div>

        {/* Coin stack */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '14px', alignItems: 'center' }}>
          {[{ symbol: '₡', cls: 'coin-float-1' }, { symbol: '$', cls: 'coin-float-2', alt: true }, { symbol: '€', cls: 'coin-float-3' }].map(({ symbol, cls, alt }) => (
            <div key={symbol} className={cls} style={{
              width: '58px', height: '58px', borderRadius: '50%',
              background: alt ? '#faf6ed' : '#d4ad7d',
              border: '3px solid #faf6ed',
              display: 'grid', placeItems: 'center',
              fontFamily: 'Fraunces, serif', fontWeight: 600,
              color: alt ? '#b8905c' : '#faf6ed',
              fontSize: '22px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }}>{symbol}</div>
          ))}
          <span style={{ color: '#faf6ed', fontSize: '13px', fontWeight: 500, opacity: 0.9, marginLeft: '8px' }}>
            Pequeño hoy · Grande mañana
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: '#faf6ed' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: '10px' }}>
            Hola de nuevo,{' '}
            <em style={{ fontStyle: 'italic', color: '#5aba74' }}>hormiguita</em>
          </h2>
          <p style={{ color: '#5c5a52', fontSize: '15px', marginBottom: '36px' }}>
            Ingresa tus datos para seguir rastreando tus gastos.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2b2a26', marginBottom: '8px', letterSpacing: '0.01em' }}>
                Usuario
              </label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="tu.nombre"
                required
                autoComplete="username"
                style={inputStyle}
                onFocus={e => { e.target.style.background = '#faf6ed'; e.target.style.borderColor = '#7bd191'; e.target.style.boxShadow = '0 0 0 4px rgba(123,209,145,0.15)'; }}
                onBlur={e => { e.target.style.background = '#f2ecdc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#2b2a26', marginBottom: '8px', letterSpacing: '0.01em' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: '52px' }}
                  onFocus={e => { e.target.style.background = '#faf6ed'; e.target.style.borderColor = '#7bd191'; e.target.style.boxShadow = '0 0 0 4px rgba(123,209,145,0.15)'; }}
                  onBlur={e => { e.target.style.background = '#f2ecdc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9a958a', cursor: 'pointer', padding: '4px' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                {error}
              </div>
            )}

            <div style={{ marginBottom: '28px' }} />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '17px',
                background: loading ? '#9a958a' : '#2b2a26',
                color: '#faf6ed',
                border: 'none', borderRadius: '14px',
                fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.background = '#5aba74'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 20px 60px -20px rgba(90,186,116,0.4)'; } }}
              onMouseLeave={e => { e.target.style.background = loading ? '#9a958a' : '#2b2a26'; e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
            >
              {loading ? 'Ingresando...' : 'Entrar al panel'}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
