import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../api/client';
import { CATEGORIES } from '../constants/categories';

function formatCRC(v) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(v ?? 0);
}

const panel = {
  background: '#faf6ed',
  border: '1.5px solid #e8e1cf',
  borderRadius: '20px',
  padding: '28px',
  marginBottom: '18px',
};

function StatCard({ label, value, sub, accent }) {
  const accents = {
    green:   { bg: 'rgba(123,209,145,0.12)', border: '#7bd191', dot: '#5aba74' },
    caramel: { bg: 'rgba(212,173,125,0.12)', border: '#d4ad7d', dot: '#b8905c' },
    red:     { bg: 'rgba(239,68,68,0.08)',   border: '#fca5a5', dot: '#ef4444' },
    ink:     { bg: '#f2ecdc',               border: '#e8e1cf', dot: '#9a958a' },
  };
  const a = accents[accent] ?? accents.ink;
  return (
    <div style={{ background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: '20px', padding: '24px 28px' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 500, letterSpacing: '-0.02em', color: '#2b2a26', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#2b2a26', marginBottom: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: '#9a958a' }}>{sub}</div>}
    </div>
  );
}

function PanelTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '22px' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.015em', color: '#2b2a26' }}>{children}</h2>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d4ad7d', display: 'inline-block', flexShrink: 0 }} />
    </div>
  );
}

const USER_COLORS  = ['#7bd191', '#f87171'];
const BAR_COLOR    = '#d4ad7d';

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: '#2b2a26', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#faf6ed', fontFamily: 'inherit' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 500 }}>{value}</div>
      <div style={{ color: 'rgba(250,246,237,0.7)', marginTop: '2px' }}>{name}</div>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#2b2a26', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#faf6ed', fontFamily: 'inherit' }}>
      <div style={{ color: 'rgba(250,246,237,0.7)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 500 }}>{formatCRC(payload[0].value)}</div>
    </div>
  );
}

export default function AdminSummary() {
  const [userStats, setUserStats]       = useState(null);
  const [expenseStats, setExpenseStats] = useState(null);
  const [allExpenses, setAllExpenses]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/expenses/stats'),
      api.get('/expenses'),
    ])
      .then(([u, e, ex]) => {
        setUserStats(u.data);
        setExpenseStats(e.data);
        setAllExpenses(Array.isArray(ex.data) ? ex.data : (ex.data?.expenses ?? []));
      })
      .catch(() => setError('Error al cargar estadísticas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Resumen <em style={{ fontStyle: 'italic', color: '#5aba74' }}>general</em>.
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #e8e1cf', borderTopColor: '#7bd191', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', padding: '12px 16px', borderRadius: '12px' }}>{error}</div>
      </div>
    );
  }

  const activeRate  = userStats?.total > 0 ? Math.round((userStats.active  / userStats.total) * 100) : 0;
  const deletedRate = userStats?.total > 0 ? Math.round((userStats.deleted / userStats.total) * 100) : 0;

  const pieData = [
    { name: 'Activos',    value: userStats?.active  ?? 0 },
    { name: 'Eliminados', value: userStats?.deleted ?? 0 },
  ].filter(d => d.value > 0);

  const catTotals = CATEGORIES.map(cat => ({
    name: cat.label,
    total: allExpenses.filter(ex => ex.category === cat.value).reduce((s, ex) => s + parseFloat(ex.amount || 0), 0),
    color: cat.color,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Title */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Resumen <em style={{ fontStyle: 'italic', color: '#5aba74' }}>general</em>.
        </h1>
      </div>

      {/* Stats banner */}
      <div style={{ background: 'linear-gradient(135deg, #7bd191 0%, #86d69c 100%)', borderRadius: '24px', padding: '28px 32px', marginBottom: '24px', color: '#2b2a26' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>
          Total gastos en el sistema
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '16px' }}>
          {formatCRC(expenseStats?.totalAmount)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Registros', val: expenseStats?.totalCount ?? 0 },
            { label: 'Usuarios totales', val: userStats?.total ?? 0 },
            { label: 'Prom. por usuario', val: formatCRC(expenseStats?.averagePerUser) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: 'rgba(43,42,38,0.12)', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 500 }}>{val}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard label="Usuarios registrados" value={userStats?.total ?? 0}   sub="Total histórico"            accent="ink" />
        <StatCard label="Usuarios activos"      value={userStats?.active ?? 0}  sub={`${activeRate}% del total`}  accent="green" />
        <StatCard label="Cuentas eliminadas"    value={userStats?.deleted ?? 0} sub={`${deletedRate}% del total`} accent="red" />
      </div>

      {/* User distribution pie chart */}
      <div style={panel}>
        <PanelTitle>Distribución de usuarios</PanelTitle>
        {pieData.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#9a958a', textAlign: 'center', padding: '24px 0' }}>No hay datos de usuarios aún.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
            {/* Pie */}
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={USER_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend + bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Activos',    count: userStats?.active ?? 0,  color: '#7bd191' },
                { label: 'Eliminados', count: userStats?.deleted ?? 0, color: '#f87171' },
              ].map(({ label, count, color }) => {
                const pct = userStats?.total > 0 ? Math.round((count / userStats.total) * 100) : 0;
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, color: '#2b2a26' }}>{label}</span>
                      </span>
                      <span style={{ color: '#9a958a' }}>{count} <span style={{ fontSize: '11px' }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: '6px', background: '#f2ecdc', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px dashed #e8e1cf', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ fontSize: '12px', color: '#9a958a', marginBottom: '4px' }}>Total de usuarios</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 500, color: '#2b2a26' }}>{userStats?.total ?? 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expense by category bar chart */}
      <div style={panel}>
        <PanelTitle>Gastos por categoría</PanelTitle>
        {catTotals.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#9a958a', textAlign: 'center', padding: '24px 0' }}>No hay gastos registrados aún.</p>
        ) : (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catTotals} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cf" horizontal={false} />
                <XAxis
                  type="number" tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#9a958a' }}
                  tickFormatter={v => formatCRC(v)} axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name" width={120}
                  tick={{ fontSize: 12, fontFamily: 'inherit', fill: '#2b2a26' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(123,209,145,0.08)' }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} maxBarSize={28}>
                  {catTotals.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expense summary table */}
      <div style={panel}>
        <PanelTitle>Resumen de gastos</PanelTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Total registrado en el sistema', value: formatCRC(expenseStats?.totalAmount), accent: '#5aba74' },
            { label: 'Número de transacciones',        value: expenseStats?.totalCount ?? 0,          accent: '#d4ad7d' },
            { label: 'Promedio de gasto por usuario',  value: formatCRC(expenseStats?.averagePerUser), accent: '#b8905c' },
            { label: 'Usuarios con gastos',            value: userStats?.active ?? 0,                  accent: '#7bd191' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#f2ecdc', borderRadius: '14px', padding: '18px 20px', borderLeft: `3px solid ${accent}` }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', fontWeight: 500, color: '#2b2a26', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#9a958a' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
