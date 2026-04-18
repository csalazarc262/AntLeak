import { useState, useEffect } from 'react';
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

function RoleBadge({ role }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: role === 'admin' ? '#f5e9d4' : '#f2ecdc', border: `1.5px solid ${role === 'admin' ? '#d4ad7d' : '#e8e1cf'}`, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, color: '#2b2a26' }}>
      {role === 'admin' ? '⬡ Admin' : '⬡ Usuario'}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{ display: 'inline-flex', background: active ? '#edfaf1' : '#fef2f2', border: `1.5px solid ${active ? '#a8e0b5' : '#fecaca'}`, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, color: active ? '#2b6640' : '#b91c1c' }}>
      {active ? 'Activo' : 'Eliminado'}
    </span>
  );
}

function UserModal({ mode, user, onClose, onSaved }) {
  const isEdit = mode === 'edit';
  const [form, setForm]     = useState(isEdit ? { email: user.email, role: user.role, password: '' } : { username: '', email: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) {
        const updates = { email: form.email, role: form.role };
        if (form.password) updates.password = form.password;
        await api.put(`/users/${user.id}`, updates);
      } else { await api.post('/users', form); }
      onSaved();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar.'); setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,42,38,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ background: '#faf6ed', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(43,42,38,0.25)', width: '100%', maxWidth: '460px', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1.5px solid #e8e1cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.015em' }}>
            {isEdit ? `Editar: ${user.username}` : 'Nuevo usuario'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a958a', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
          {!isEdit && (
            <div style={{ marginBottom: '18px' }}>
              <label style={labelSt}>Usuario</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="nombre de usuario" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          )}
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>{isEdit ? 'Nueva contraseña (vacío = no cambiar)' : 'Contraseña'}</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required={!isEdit} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelSt}>Rol</label>
            <select name="role" value={form.role} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: '#5c5a52', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f2ecdc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >Cancelar</button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '13px', background: saving ? '#9a958a' : '#2b2a26', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#faf6ed', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5aba74'; }}
              onMouseLeave={e => { e.currentTarget.style.background = saving ? '#9a958a' : '#2b2a26'; }}
            >{saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState({ open: false, mode: 'create', user: null });
  const [confirmDelete, setConfirm] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try { setLoading(true); setError(''); const { data } = await api.get('/users'); setUsers(data); }
    catch { setError('Error al cargar usuarios.'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try { await api.delete(`/users/${confirmDelete.id}`); setConfirm(null); fetchUsers(); }
    catch { setError('Error al eliminar el usuario.'); }
    finally { setDeleting(false); }
  }

  const active = users.filter(u => u.active).length;

  return (
    <div>
      {/* Title + action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Gestión de <em style={{ fontStyle: 'italic', color: '#5aba74' }}>usuarios</em>.
          </h1>
          <div style={{ fontSize: '13px', color: '#9a958a', marginTop: '8px' }}>{users.length} usuarios · {active} activos</div>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: 'create', user: null })}
          style={{ padding: '11px 20px', background: '#7bd191', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#2b2a26', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(123,209,145,0.35)', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5aba74'; e.currentTarget.style.color = '#faf6ed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#7bd191'; e.currentTarget.style.color = '#2b2a26'; e.currentTarget.style.transform = ''; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo usuario
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px' }}>{error}</div>}

      {/* Table panel */}
      <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a958a' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #e8e1cf', borderTopColor: '#7bd191', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px' }}>Cargando usuarios...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a958a', fontSize: '14px' }}>No hay usuarios registrados.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e8e1cf', background: '#f2ecdc' }}>
                  {['Usuario', 'Email', 'Rol', 'Estado', 'Registro', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: '#9a958a', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'Fraunces, serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f2ecdc' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7f3ea'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#2b2a26' }}>{u.username}</td>
                    <td style={{ padding: '14px 20px', color: '#9a958a', fontSize: '13px' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge active={u.active} /></td>
                    <td style={{ padding: '14px 20px', color: '#9a958a', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString('es-CR')}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => setModal({ open: true, mode: 'edit', user: u })}
                          style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#5c5a52', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f2ecdc'; e.currentTarget.style.borderColor = '#d4ad7d'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e8e1cf'; }}
                        >Editar</button>
                        {u.active && (
                          <button onClick={() => setConfirm(u)}
                            style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #fecaca', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#b91c1c', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <UserModal mode={modal.mode} user={modal.user}
          onClose={() => setModal({ open: false, mode: 'create', user: null })}
          onSaved={() => { setModal({ open: false, mode: 'create', user: null }); fetchUsers(); }}
        />
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,42,38,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: '#faf6ed', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(43,42,38,0.25)', width: '100%', maxWidth: '380px', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', display: 'grid', placeItems: 'center', marginBottom: '20px', fontSize: '22px' }}>🗑️</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>¿Eliminar usuario?</h3>
            <p style={{ fontSize: '14px', color: '#5c5a52', marginBottom: '24px' }}>
              Se desactivará la cuenta de <strong>{confirmDelete.username}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirm(null)}
                style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: '#5c5a52', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f2ecdc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Cancelar</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: '13px', background: '#ef4444', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer' }}
              >{deleting ? 'Eliminando...' : 'Sí, eliminar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
