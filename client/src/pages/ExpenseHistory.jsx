import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/client';
import { CATEGORIES, CAT_MAP as CAT, CatIcons } from '../constants/categories';

function formatCRC(v) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v ?? 0);
}
function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function topCategory(list) {
  if (!list.length) return null;
  const c = {};
  list.forEach(e => { c[e.category] = (c[e.category] ?? 0) + 1; });
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
}

const panel = { background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '26px' };
const sectionTitle = (text, dot = true) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
    <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.015em' }}>{text}</h2>
    {dot && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4ad7d', display: 'inline-block' }} />}
  </div>
);

/* Custom tooltip for charts */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#2b2a26', border: 'none', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 30px -10px rgba(43,42,38,0.3)' }}>
      <div style={{ fontSize: '11px', color: 'rgba(250,246,237,0.6)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 500, color: '#faf6ed' }}>{formatCRC(payload[0].value)}</div>
    </div>
  );
}

function DeleteModal({ expense, onCancel, onConfirm, deleting }) {
  const cat = CAT[expense.category] ?? { label: expense.category };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,42,38,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ background: '#faf6ed', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(43,42,38,0.25)', width: '100%', maxWidth: '380px', padding: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', display: 'grid', placeItems: 'center', marginBottom: '20px', fontSize: '22px' }}>🗑️</div>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>¿Eliminar gasto?</h3>
        <p style={{ fontSize: '14px', color: '#5c5a52', marginBottom: '16px' }}>Esta acción no se puede deshacer.</p>
        <div style={{ background: '#f2ecdc', border: '1.5px solid #e8e1cf', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: '#2b2a26', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#b8905c' }}>{CatIcons[expense.category]}</span>
            <strong>{cat.label}</strong>{expense.description ? ` · ${expense.description}` : ''}
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 500, color: '#2b2a26', marginTop: '4px' }}>{formatCRC(expense.amount)}</div>
          <div style={{ fontSize: '12px', color: '#9a958a', marginTop: '2px' }}>{formatDate(expense.date)}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '13px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: '#5c5a52', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f2ecdc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Cancelar</button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ flex: 1, padding: '13px', background: '#ef4444', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer' }}
          >{deleting ? 'Eliminando...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseHistory() {
  const [expenses, setExpenses]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filters, setFilters]           = useState({ category: '', dateFrom: '', dateTo: '' });
  const [showFilters, setShowFilters]   = useState(false);
  const [toDelete, setToDelete]         = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    api.get('/expenses')
      .then(({ data }) => setExpenses(data))
      .catch(() => setError('Error al cargar el historial.'))
      .finally(() => setLoading(false));
  }, []);

  function handleFilter(e) { setFilters(p => ({ ...p, [e.target.name]: e.target.value })); }
  function clearFilters() { setFilters({ category: '', dateFrom: '', dateTo: '' }); }

  const filtered = useMemo(() => expenses.filter(e => {
    if (filters.category && e.category !== filters.category) return false;
    if (filters.dateFrom && e.date < filters.dateFrom) return false;
    if (filters.dateTo   && e.date > filters.dateTo)   return false;
    return true;
  }), [expenses, filters]);

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + parseFloat(e.amount), 0), [filtered]);
  const topCat      = useMemo(() => topCategory(filtered), [filtered]);
  const hasFilters  = filters.category || filters.dateFrom || filters.dateTo;

  /* ── Chart data ── */
  const areaData = useMemo(() => {
    const now = new Date();
    const map = {};
    expenses.forEach(e => { map[e.date] = (map[e.date] || 0) + parseFloat(e.amount); });
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }), amount: map[key] || 0 });
    }
    return days;
  }, [expenses]);

  const catData = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + parseFloat(e.amount); });
    return Object.entries(map)
      .map(([cat, amount]) => ({ name: CAT[cat]?.label || cat, amount, color: CAT[cat]?.color || '#9a958a' }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${toDelete.id}`);
      setExpenses(p => p.filter(e => e.id !== toDelete.id));
      setToDelete(null);
    } catch { setError('Error al eliminar el gasto.'); }
    finally { setDeleting(false); }
  }

  const selectStyle = {
    padding: '11px 14px', background: '#f2ecdc', border: '1.5px solid transparent',
    borderRadius: '12px', fontSize: '13px', fontFamily: 'inherit', color: '#2b2a26',
    outline: 'none', cursor: 'pointer', transition: 'all 0.2s',
  };
  const inputFilter = { ...selectStyle, cursor: 'default' };

  return (
    <div>
      {/* Title + filter toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Historial de <em style={{ fontStyle: 'italic', color: '#5aba74' }}>gastos</em>.
          </h1>
          <div style={{ fontSize: '13px', color: '#9a958a', marginTop: '8px' }}>{expenses.length} gasto{expenses.length !== 1 ? 's' : ''} registrado{expenses.length !== 1 ? 's' : ''}</div>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{ padding: '11px 18px', background: hasFilters ? '#edfaf1' : 'transparent', border: `1.5px solid ${hasFilters ? '#a8e0b5' : '#e8e1cf'}`, borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, color: hasFilters ? '#2b6640' : '#2b2a26', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
          onMouseEnter={e => { if (!hasFilters) { e.currentTarget.style.background = '#f2ecdc'; e.currentTarget.style.borderColor = '#d4ad7d'; } }}
          onMouseLeave={e => { if (!hasFilters) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e8e1cf'; } }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtros
          {hasFilters && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#5aba74', display: 'inline-block' }} />}
        </button>
      </div>

      {/* Stats mini-banner */}
      <div style={{ background: 'linear-gradient(135deg, #7bd191 0%, #86d69c 100%)', borderRadius: '20px', padding: '24px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '24px', marginBottom: '28px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 40px -12px rgba(90,186,116,0.3)' }} className="stats-grid">
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: '#d4ad7d', borderRadius: '50%', opacity: 0.25, filter: 'blur(20px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '6px', fontFamily: 'Fraunces, serif' }}>Total {hasFilters ? '(filtrado)' : 'gastado'}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 400, letterSpacing: '-0.02em', color: '#2b2a26', lineHeight: 1 }}>{formatCRC(totalAmount)}</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid rgba(43,42,38,0.15)', paddingLeft: '20px' }} className="stats-mini-border">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '6px', fontFamily: 'Fraunces, serif' }}>Gastos</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 500, color: '#2b2a26' }}>{filtered.length}</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid rgba(43,42,38,0.15)', paddingLeft: '20px' }} className="stats-mini-border">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'rgba(43,42,38,0.7)', marginBottom: '6px', fontFamily: 'Fraunces, serif' }}>Top categoría</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 500, color: '#2b2a26' }}>
            {topCat
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#b8905c' }}>{CatIcons[topCat]}</span>{CAT[topCat]?.label}</span>
              : '—'}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ ...panel, marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#9a958a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>Categoría</label>
              <select name="category" value={filters.category} onChange={handleFilter} style={selectStyle}
                onFocus={e => { e.target.style.borderColor = '#7bd191'; }}
                onBlur={e => { e.target.style.borderColor = 'transparent'; }}
              >
                <option value="">Todas</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#9a958a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>Desde</label>
              <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilter} style={inputFilter}
                onFocus={e => { e.target.style.borderColor = '#7bd191'; }} onBlur={e => { e.target.style.borderColor = 'transparent'; }}
              />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#9a958a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>Hasta</label>
              <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilter} style={inputFilter}
                onFocus={e => { e.target.style.borderColor = '#7bd191'; }} onBlur={e => { e.target.style.borderColor = 'transparent'; }}
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                style={{ padding: '11px 16px', background: 'transparent', border: '1.5px solid #e8e1cf', borderRadius: '12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, color: '#9a958a', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f2ecdc'; e.currentTarget.style.color = '#2b2a26'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a958a'; }}
              >× Limpiar</button>
            )}
          </div>
        </div>
      )}

      {/* Charts row */}
      {!loading && expenses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px', marginBottom: '28px' }} className="bottom-grid-r">
          {/* Area chart - spending over 30 days */}
          <div style={panel}>
            {sectionTitle('Gasto diario · últimos 30 días')}
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7bd191" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7bd191" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cf" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9a958a', fontFamily: 'Fraunces, serif' }} tickLine={false} axisLine={false}
                  interval={Math.floor(areaData.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: '#9a958a', fontFamily: 'Fraunces, serif' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v === 0 ? '' : `₡${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e8e1cf', strokeWidth: 1 }} />
                <Area dataKey="amount" stroke="#5aba74" strokeWidth={2} fill="url(#greenGrad)" dot={false} activeDot={{ r: 4, fill: '#5aba74', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - by category */}
          <div style={panel}>
            {sectionTitle('Por categoría')}
            {catData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a958a', fontSize: '14px' }}>Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cf" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9a958a' }} tickLine={false} axisLine={false}
                    tickFormatter={v => `₡${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5c5a52', fontFamily: 'Fraunces, serif' }} tickLine={false} axisLine={false} width={100} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(232,225,207,0.4)' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px' }}>{error}</div>}

      {/* Table */}
      <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', overflow: 'hidden' }}>
        {sectionTitle && null}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9a958a' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #e8e1cf', borderTopColor: '#7bd191', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px' }}>Cargando historial...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9a958a' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{hasFilters ? '🔍' : '💸'}</div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: '#5c5a52' }}>{hasFilters ? 'Sin gastos con esos filtros.' : 'Aún no tienes gastos registrados.'}</div>
            {hasFilters && <button onClick={clearFilters} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#5aba74', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Limpiar filtros</button>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e8e1cf', background: '#f2ecdc' }}>
                  {['Fecha', 'Categoría', 'Descripción', 'Monto', ''].map(h => (
                    <th key={h} style={{ textAlign: h === 'Monto' ? 'right' : 'left', padding: '14px 20px', fontSize: '11px', fontWeight: 700, color: '#9a958a', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'Fraunces, serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => {
                  const cat = CAT[exp.category] ?? { label: exp.category };
                  return (
                    <tr key={exp.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f2ecdc' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7f3ea'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px', color: '#9a958a', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDate(exp.date)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f2ecdc', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, color: '#5c5a52' }}>
                          <span style={{ color: '#b8905c' }}>{CatIcons[exp.category]}</span>{cat.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#9a958a', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description || <em style={{ color: '#e8e1cf' }}>Sin descripción</em>}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: '16px', color: '#2b2a26', whiteSpace: 'nowrap' }}>
                        {formatCRC(exp.amount)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button onClick={() => setToDelete(exp)}
                          style={{ padding: '6px 10px', background: 'transparent', border: '1.5px solid #fecaca', borderRadius: '8px', color: '#b91c1c', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #e8e1cf', background: '#f2ecdc' }}>
                  <td colSpan={3} style={{ padding: '12px 20px', fontSize: '12px', color: '#9a958a' }}>
                    {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtrados)' : ''}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '18px', color: '#5aba74' }}>{formatCRC(totalAmount)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {toDelete && <DeleteModal expense={toDelete} onCancel={() => setToDelete(null)} onConfirm={handleDelete} deleting={deleting} />}
    </div>
  );
}
