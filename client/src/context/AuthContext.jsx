import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('antleak_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(token, userData) {
    localStorage.setItem('antleak_token', token);
    localStorage.setItem('antleak_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('antleak_token');
    localStorage.removeItem('antleak_user');
    setUser(null);
  }

  function updateUserData(updates) {
    const updated = { ...user, ...updates };
    localStorage.setItem('antleak_user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
