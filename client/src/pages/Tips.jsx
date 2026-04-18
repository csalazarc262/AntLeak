import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Data ── */
const WHAT_IS = [
  {
    emoji: '☕',
    title: 'El cafecito de cada día',
    desc: 'Un café de ₡1 500 al día parece insignificante. Pero al mes son ₡45 000, y al año ¡₡540 000!',
    color: '#d4ad7d',
  },
  {
    emoji: '🍫',
    title: 'El antojo de media tarde',
    desc: 'Ese chocolate, snack o bebida que "no cuesta nada" se repite 20 días al mes sin que lo notes.',
    color: '#a8e0b5',
  },
  {
    emoji: '🚕',
    title: 'El Uber "por comodidad"',
    desc: 'Cuando el bus hubiera funcionado igual, pero el Uber "era más fácil" ese día... y también el siguiente.',
    color: '#7bd191',
  },
  {
    emoji: '📱',
    title: 'Suscripciones olvidadas',
    desc: 'Apps, servicios y plataformas que sigues pagando aunque ya no uses. Cada una, una hormiga silenciosa.',
    color: '#e8c8a0',
  },
];

const IDENTIFIERS = [
  { icon: '🔁', text: 'Lo compras casi todos los días sin pensarlo' },
  { icon: '💸', text: 'El monto es tan pequeño que "no vale la pena contarlo"' },
  { icon: '😶', text: 'Al mes no recuerdas en qué gastaste ese dinero' },
  { icon: '🤷', text: 'Lo compras por hábito, no por necesidad real' },
  { icon: '📊', text: 'Sumado al año supera un mes de tu salario' },
  { icon: '😬', text: 'Si alguien te preguntara, te daría un poco de vergüenza contarlo' },
];

const HOW_ANTLEAK = [
  {
    step: '01',
    title: 'Registra en el momento',
    desc: 'Apenas compras algo, lo anotas. La inmediatez elimina el olvido y te hace más consciente del gasto.',
    color: '#7bd191',
  },
  {
    step: '02',
    title: 'Identifica patrones',
    desc: 'El historial y gráficos revelan qué categorías se llevan más de tu bolsillo mes tras mes.',
    color: '#d4ad7d',
  },
  {
    step: '03',
    title: 'Visualiza el acumulado',
    desc: 'Ver el total mensual en lugar de gastos aislados activa tu instinto de ahorro de forma natural.',
    color: '#a8e0b5',
  },
  {
    step: '04',
    title: 'Toma decisiones informadas',
    desc: 'Con datos reales, puedes decidir qué hormigas vale la pena eliminar y cuáles aceptar conscientemente.',
    color: '#e8c8a0',
  },
];

const QUIZ_ITEMS = [
  { q: '¿Compraste algo hoy sin planearlo?', hint: 'Un snack, un café, una app...' },
  { q: '¿Tienes alguna suscripción que casi no usas?', hint: 'Streaming, apps, membresías...' },
  { q: '¿Hubo al menos 3 gastos pequeños esta semana que no recuerdas bien?', hint: 'Propinas, recargas, detallitos...' },
  { q: '¿Sabes exactamente cuánto gastaste el mes pasado en "pequeñas cosas"?', hint: 'No vale estimar, tiene que ser exacto.' },
];

/* ── Components ── */
function SectionEyebrow({ children }) {
  return (
    <div style={{ fontSize: '13px', color: '#b8905c', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>
      {children}
    </div>
  );
}

function SectionHead({ pre, main, emText }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <SectionEyebrow>{pre}</SectionEyebrow>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
        {main} <em style={{ fontStyle: 'italic', color: '#5aba74' }}>{emText}</em>{/[?!]$/.test(emText) ? '' : '.'}
      </h2>
    </div>
  );
}

function AccordionItem({ emoji, title, desc, color, isOpen, onToggle }) {
  return (
    <div
      style={{
        background: isOpen ? `${color}18` : '#faf6ed',
        border: `1.5px solid ${isOpen ? color : '#e8e1cf'}`,
        borderRadius: '18px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 500, color: '#2b2a26', flex: 1 }}>{title}</span>
        <span style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: isOpen ? color : '#f2ecdc',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          transition: 'all 0.25s ease',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#2b2a26' : '#9a958a'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </div>
      <div style={{
        maxHeight: isOpen ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
      }}>
        <div style={{ padding: '0 24px 22px', fontSize: '15px', color: '#5c5a52', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function QuizItem({ q, hint, answer, onAnswer }) {
  return (
    <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '18px', padding: '22px 26px' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 500, color: '#2b2a26', marginBottom: '6px' }}>{q}</div>
      <div style={{ fontSize: '13px', color: '#9a958a', marginBottom: '18px' }}>{hint}</div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[{ label: 'Sí', val: true, activeColor: '#ef4444', activeBg: 'rgba(239,68,68,0.1)', activeBorder: '#fca5a5' },
          { label: 'No', val: false, activeColor: '#5aba74', activeBg: 'rgba(90,186,116,0.1)', activeBorder: '#7bd191' }].map(({ label, val, activeColor, activeBg, activeBorder }) => {
          const active = answer === val;
          return (
            <button
              key={label}
              onClick={() => onAnswer(val)}
              style={{
                padding: '9px 24px', borderRadius: '12px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease',
                background: active ? activeBg : '#f2ecdc',
                border: `1.5px solid ${active ? activeBorder : 'transparent'}`,
                color: active ? activeColor : '#9a958a',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function Tips() {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const yesCount = Object.values(quizAnswers).filter(v => v === true).length;
  const answered = Object.keys(quizAnswers).length;

  function getResult() {
    if (yesCount >= 3) return { level: 'alto', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#fca5a5', msg: 'Las hormigas están comiendo tu presupuesto sin que lo notes. AntLeak es justo lo que necesitas.' };
    if (yesCount >= 1) return { level: 'medio', color: '#d4ad7d', bg: 'rgba(212,173,125,0.12)', border: '#d4ad7d', msg: 'Hay hormigas merodeando. Con un poco de atención puedes cerrarles el paso.' };
    return { level: 'bajo', color: '#5aba74', bg: 'rgba(90,186,116,0.1)', border: '#7bd191', msg: '¡Excelente! Tienes buen control. AntLeak te ayuda a mantenerlo así.' };
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* ── Page title ── */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Gastos <em style={{ fontStyle: 'italic', color: '#5aba74' }}>hormiga</em>.
        </h1>
        <p style={{ fontSize: '15px', color: '#5c5a52', marginTop: '14px', lineHeight: 1.65, maxWidth: '520px' }}>
          Pequeños, frecuentes e invisibles. Son los gastos que individualmente parecen inofensivos pero que, sumados, pueden representar una parte significativa de tus ingresos.
        </p>
      </div>

      {/* ── What is section ── */}
      <section style={{ marginBottom: '52px' }}>
        <SectionHead main="Ejemplos de gastos" emText="hormiga" /> 
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {WHAT_IS.map((item, i) => (
            <AccordionItem
              key={i}
              {...item}
              isOpen={openAccordion === i}
              onToggle={() => setOpenAccordion(openAccordion === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ── Identifier checklist ── */}
      <section style={{ marginBottom: '52px' }}>
        <SectionHead main="¿Cómo" emText="identificarlos?" />
        <div style={{ background: '#faf6ed', border: '1.5px solid #e8e1cf', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {IDENTIFIERS.map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <span style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: '#f2ecdc', display: 'grid', placeItems: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>{icon}</span>
              <span style={{ fontSize: '15px', color: '#2b2a26', lineHeight: 1.55, paddingTop: '8px' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quiz ── */}
      <section style={{ marginBottom: '52px' }}>
        <SectionHead main="¿Tienes gastos" emText="hormiga?" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
          {QUIZ_ITEMS.map((item, i) => (
            <QuizItem
              key={i}
              {...item}
              answer={quizAnswers[i]}
              onAnswer={val => {
                setQuizAnswers(prev => ({ ...prev, [i]: val }));
                setShowResult(false);
              }}
            />
          ))}
        </div>
        {answered === QUIZ_ITEMS.length && !showResult && (
          <button
            onClick={() => setShowResult(true)}
            style={{
              width: '100%', padding: '15px', background: '#2b2a26', color: '#faf6ed',
              border: 'none', borderRadius: '14px', fontFamily: 'inherit', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5aba74'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2b2a26'; e.currentTarget.style.transform = ''; }}
          >
            Ver mi resultado →
          </button>
        )}
        {showResult && (() => {
          const r = getResult();
          return (
            <div style={{ background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: '18px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 500, color: r.color, textTransform: 'capitalize' }}>
                  Riesgo {r.level}
                </span>
                <span style={{ fontSize: '12px', background: r.bg, border: `1px solid ${r.border}`, color: r.color, borderRadius: '20px', padding: '2px 10px', fontWeight: 600 }}>
                  {yesCount}/{QUIZ_ITEMS.length} señales
                </span>
              </div>
              <p style={{ fontSize: '15px', color: '#2b2a26', lineHeight: 1.6 }}>{r.msg}</p>
              <button
                onClick={() => { setQuizAnswers({}); setShowResult(false); }}
                style={{ marginTop: '16px', background: 'none', border: 'none', fontSize: '13px', color: '#9a958a', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Repetir test
              </button>
            </div>
          );
        })()}
      </section>

      {/* ── How AntLeak helps ── */}
      <section style={{ marginBottom: '52px' }}>
        <SectionHead main="Cómo AntLeak te" emText="ayuda" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {HOW_ANTLEAK.map(({ step, title, desc, color }) => (
            <div key={step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '16px', background: color,
                display: 'grid', placeItems: 'center', flexShrink: 0,
                fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '15px', color: '#2b2a26',
              }}>
                {step}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 500, color: '#2b2a26', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '14px', color: '#5c5a52', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div style={{ background: 'linear-gradient(135deg, #7bd191 0%, #86d69c 100%)', borderRadius: '24px', padding: '36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: '#d4ad7d', borderRadius: '50%', opacity: 0.25, filter: 'blur(20px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#2b2a26', marginBottom: '10px' }}>
            ¿Listo para eliminar las <em style={{ fontStyle: 'italic' }}>hormigas</em>?
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(43,42,38,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
            El primer paso es registrar. Cada gasto que anotas es una hormiga que ya no se escapa.
          </p>
          <button
            onClick={() => navigate('/dashboard/nuevo-gasto')}
            style={{
              padding: '14px 32px', background: '#2b2a26', color: '#faf6ed', border: 'none',
              borderRadius: '14px', fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.25s ease',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(43,42,38,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            Registrar mi primer gasto
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
