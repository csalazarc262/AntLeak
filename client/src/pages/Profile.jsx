import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const inputStyle = {
  width: '100%', padding: '16px 18px',
  background: '#f2ecdc', border: '1.5px solid transparent',
  borderRadius: '14px', fontSize: '15px',
  fontFamily: 'inherit', color: '#2b2a26',
  transition: 'all 0.25s ease', outline: 'none',
};
const onFocus = e => { e.target.style.background = '#faf6ed'; e.target.style.borderColor = '#7bd191'; e.target.style.boxShadow = '0 0 0 4px rgba(123,209,145,0.15)'; };
const onBlur  = e => { e.target.style.background = '#f2ecdc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; };
const labelSt = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#2b2a26', marginBottom: '8px', letterSpacing: '0.01em' };
const panel   = { background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '28px', marginBottom: '18px' };

function Alert({ type, msg, onClose }) {
  const s = type === 'ok'
    ? { background: '#f0faf3', border: '1.5px solid #a8e0b5', color: '#2b6640' }
    : { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' };
  return (
    <div style={{ ...s, borderRadius: '12px', padding: '12px 16px', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ flex: 1 }}>{msg}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '16px' }}>×</button>}
    </div>
  );
}

function SaveBtn({ label, saving }) {
  return (
    <button
      type="submit" disabled={saving}
      style={{ padding: '13px 28px', background: saving ? '#9a958a' : '#2b2a26', color: '#faf6ed', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#5aba74'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.background = saving ? '#9a958a' : '#2b2a26'; e.currentTarget.style.transform = ''; }}
    >
      {saving ? 'Guardando...' : label}
      {!saving && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      )}
    </button>
  );
}

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const [emailForm, setEmailForm]       = useState({ email: '' });
  const [emailSaving, setEmailSaving]   = useState(false);
  const [emailMsg, setEmailMsg]         = useState(null);

  const [passForm, setPassForm]         = useState({ password: '', confirm: '' });
  const [passSaving, setPassSaving]     = useState(false);
  const [passMsg, setPassMsg]           = useState(null);

  useEffect(() => {
    api.get(`/users/${user.id}`)
      .then(({ data }) => { setProfile(data); setEmailForm({ email: data.email }); })
      .catch(() => { setProfile({ ...user, created_at: null }); setEmailForm({ email: user.email }); })
      .finally(() => setLoading(false));
  }, [user.id]);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (emailForm.email === profile?.email) { setEmailMsg({ type: 'err', text: 'El email es igual al actual.' }); return; }
    setEmailSaving(true); setEmailMsg(null);
    try {
      const { data } = await api.put(`/users/${user.id}`, { email: emailForm.email });
      setProfile(p => ({ ...p, email: data.email }));
      updateUserData({ email: data.email });
      setEmailMsg({ type: 'ok', text: 'Email actualizado correctamente.' });
    } catch (err) { setEmailMsg({ type: 'err', text: err.response?.data?.error || 'Error al actualizar el email.' }); }
    finally { setEmailSaving(false); }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passForm.password !== passForm.confirm) { setPassMsg({ type: 'err', text: 'Las contraseñas no coinciden.' }); return; }
    if (passForm.password.length < 6) { setPassMsg({ type: 'err', text: 'Mínimo 6 caracteres.' }); return; }
    setPassSaving(true); setPassMsg(null);
    try {
      await api.put(`/users/${user.id}`, { password: passForm.password });
      setPassForm({ password: '', confirm: '' });
      setPassMsg({ type: 'ok', text: 'Contraseña actualizada.' });
    } catch (err) { setPassMsg({ type: 'err', text: err.response?.data?.error || 'Error al actualizar.' }); }
    finally { setPassSaving(false); }
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '??';
  const joined   = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={{ maxWidth: '560px' }}>
      {/* Title */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Mi <em style={{ fontStyle: 'italic', color: '#5aba74' }}>perfil</em>.
        </h1>
      </div>

      {/* Identity card */}
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {loading ? (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f2ecdc' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d4ad7d', display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '22px', color: '#2b2a26', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.username ?? '...'}
            </div>
            <div style={{ fontSize: '14px', color: '#9a958a', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.email ?? '...'}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: profile?.role === 'admin' ? '#f5e9d4' : '#f2ecdc', border: `1.5px solid ${profile?.role === 'admin' ? '#d4ad7d' : '#e8e1cf'}`, borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, color: '#2b2a26' }}>
                {profile?.role === 'admin' ? '⬡ Administrador' : '⬡ Usuario'}
              </span>
              {joined && <span style={{ fontSize: '12px', color: '#9a958a' }}>· Desde {joined}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Email form */}
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.015em' }}>Información personal</h2>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4ad7d', display: 'inline-block' }} />
        </div>
        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Nombre de usuario</label>
            <input value={profile?.username ?? ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '12px', color: '#9a958a', marginTop: '6px' }}>El nombre de usuario no puede modificarse.</p>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Email</label>
            <input
              type="email" value={emailForm.email}
              onChange={e => { setEmailForm({ email: e.target.value }); setEmailMsg(null); }}
              required style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          {emailMsg && <Alert type={emailMsg.type} msg={emailMsg.text} onClose={emailMsg.type === 'ok' ? () => setEmailMsg(null) : null} />}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveBtn label="Guardar email" saving={emailSaving || loading} />
          </div>
        </form>
      </div>

      {/* Password form */}
      <div style={panel}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.015em' }}>Seguridad</h2>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4ad7d', display: 'inline-block' }} />
        </div>
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Nueva contraseña</label>
            <input
              type="password" value={passForm.password} placeholder="Mínimo 6 caracteres" required
              onChange={e => { setPassForm(p => ({ ...p, password: e.target.value })); setPassMsg(null); }}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Confirmar contraseña</label>
            <input
              type="password" value={passForm.confirm} placeholder="Repite la contraseña" required
              onChange={e => { setPassForm(p => ({ ...p, confirm: e.target.value })); setPassMsg(null); }}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>
          {passMsg && <Alert type={passMsg.type} msg={passMsg.text} onClose={passMsg.type === 'ok' ? () => setPassMsg(null) : null} />}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SaveBtn label="Cambiar contraseña" saving={passSaving} />
          </div>
        </form>
      </div>
    </div>
  );
}
