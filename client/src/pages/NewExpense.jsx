import { useState } from 'react';
import api from '../api/client';
import { CATEGORIES, CatIcons } from '../constants/categories';

function today() { return new Date().toISOString().split('T')[0]; }

function formatCRC(v) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v || 0);
}

const inputStyle = {
  width: '100%', padding: '16px 18px',
  background: '#f2ecdc', border: '1.5px solid transparent',
  borderRadius: '14px', fontSize: '15px',
  fontFamily: 'inherit', color: '#2b2a26',
  transition: 'all 0.25s ease', outline: 'none',
};
const onFocus = e => { e.target.style.background = '#faf6ed'; e.target.style.borderColor = '#7bd191'; e.target.style.boxShadow = '0 0 0 4px rgba(123,209,145,0.15)'; };
const onBlur  = e => { e.target.style.background = '#f2ecdc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; };
const label   = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#2b2a26', marginBottom: '8px', letterSpacing: '0.01em' };

export default function NewExpense() {
  const [form, setForm]       = useState({ amount: '', date: today(), category: '', description: '' });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }
  function selectCategory(v) { setForm(p => ({ ...p, category: v })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category) { setError('Selecciona una categoría.'); return; }
    setSaving(true); setError(''); setSuccess(null);
    try {
      const { data } = await api.post('/expenses', {
        amount: parseFloat(form.amount), date: form.date,
        category: form.category,
        description: form.description.trim() || undefined,
      });
      setSuccess(data);
      setForm({ amount: '', date: today(), category: '', description: '' });
    } catch (err) { setError(err.response?.data?.error || 'Error al registrar el gasto.'); }
    finally { setSaving(false); }
  }

  const isValid = form.amount && parseFloat(form.amount) > 0 && form.date && form.category;
  const selCat  = CATEGORIES.find(c => c.value === form.category);

  return (
    <div style={{ maxWidth: '560px' }}>
      {/* Page title */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Registrar <em style={{ fontStyle: 'italic', color: '#5aba74' }}>gasto</em>.
        </h1>
      </div>

      {/* Success */}
      {success && (() => {
        const cat = CATEGORIES.find(c => c.value === success.category);
        return (
          <div style={{ background: '#f0faf3', border: '1.5px solid #a8e0b5', borderRadius: '16px', padding: '18px 22px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '22px', marginTop: '1px' }}>✓</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#2b2a26', marginBottom: '4px' }}>¡Gasto registrado!</div>
              <div style={{ fontSize: '14px', color: '#5c5a52' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>{formatCRC(success.amount)}</span>
                {' '}en {cat?.label} ·{' '}
                {new Date(success.date + 'T12:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9a958a', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
        );
      })()}

      {/* Form panel */}
      <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '32px' }}>
        <form onSubmit={handleSubmit}>

          {/* Amount */}
          <div style={{ marginBottom: '22px' }}>
            <label style={label}>Monto <span style={{ color: '#b8905c' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#9a958a', fontWeight: 600, fontSize: '15px', userSelect: 'none' }}>₡</span>
              <input
                type="number" name="amount" value={form.amount} onChange={handleChange}
                min="0.01" step="0.01" placeholder="0" required
                style={{ ...inputStyle, paddingLeft: '36px' }}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '22px' }}>
            <label style={label}>Fecha <span style={{ color: '#b8905c' }}>*</span></label>
            <input
              type="date" name="date" value={form.date} onChange={handleChange}
              max={today()} required
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '22px' }}>
            <label style={label}>Categoría <span style={{ color: '#b8905c' }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {CATEGORIES.map(({ value, label: lbl, color }) => {
                const active = form.category === value;
                return (
                  <button
                    key={value} type="button" onClick={() => selectCategory(value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '18px 12px', borderRadius: '16px',
                      border: `1.5px solid ${active ? color : '#e8e1cf'}`,
                      background: active ? `${color}20` : '#f2ecdc',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      outline: active ? `2px solid ${color}40` : 'none', outlineOffset: '2px',
                      color: '#b8905c',
                    }}
                  >
                    <span style={{ lineHeight: 1 }}>{CatIcons[value]}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: active ? '#2b2a26' : '#5c5a52' }}>{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <label style={label}>
              Descripción{' '}
              <span style={{ color: '#9a958a', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text" name="description" value={form.description} onChange={handleChange}
              placeholder="ej: café en el trabajo, bus al centro..."
              maxLength={120}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Preview */}
          {isValid && (
            <div style={{ background: '#f2ecdc', border: '1.5px solid #e8e1cf', borderRadius: '14px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#5c5a52', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#b8905c' }}>{selCat && CatIcons[selCat.value]}</span>{selCat?.label}
              </span>
              <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '20px', color: '#2b2a26' }}>{formatCRC(parseFloat(form.amount) || 0)}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={saving || !isValid}
            style={{
              width: '100%', padding: '17px',
              background: (saving || !isValid) ? '#9a958a' : '#2b2a26',
              color: '#faf6ed', border: 'none', borderRadius: '14px',
              fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
              cursor: (saving || !isValid) ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
            onMouseEnter={e => { if (!saving && isValid) { e.currentTarget.style.background = '#5aba74'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 60px -20px rgba(90,186,116,0.4)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = (saving || !isValid) ? '#9a958a' : '#2b2a26'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {saving ? 'Registrando...' : 'Registrar gasto'}
            {!saving && isValid && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
