-- ── Tabla de usuarios ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT        NOT NULL UNIQUE,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin')),
  active        BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ── Tabla de gastos ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      NUMERIC     NOT NULL CHECK (amount > 0),
  date        DATE        NOT NULL,
  category    TEXT        NOT NULL
              CHECK (category IN (
                'alimentacion', 'transporte', 'entretenimiento',
                'salud', 'ropa', 'otros'
              )),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Usuario admin inicial ───────────────────────────────────────────────────
-- Genera el hash en terminal: node -e "require('bcryptjs').hash('admin123',10).then(console.log)"
-- Reemplaza $HASH antes de ejecutar
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@antleak.com', '$2b$10$6SOJRuiBf0MI4hQhd31uw.4xHI5Y1Eneo11SGa.evPd8Q4zBCRrmm', 'admin')
ON CONFLICT (username) DO NOTHING;
