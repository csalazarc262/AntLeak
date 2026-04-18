const s = { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const CatIcons = {
  alimentacion: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  transporte: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  entretenimiento: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/>
    </svg>
  ),
  salud: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  ropa: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  otros: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...s}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
};

export const CATEGORIES = [
  { value: 'alimentacion',    label: 'Alimentación',    color: '#7bd191' },
  { value: 'transporte',      label: 'Transporte',      color: '#d4ad7d' },
  { value: 'entretenimiento', label: 'Entretenimiento', color: '#a8e0b5' },
  { value: 'salud',           label: 'Salud',           color: '#e8c8a0' },
  { value: 'ropa',            label: 'Ropa',            color: '#b8905c' },
  { value: 'otros',           label: 'Otros',           color: '#9a958a' },
];

export const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));
