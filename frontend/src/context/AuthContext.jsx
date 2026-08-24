import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || localStorage.getItem('fitzone_token') || null);
  const [member, setMember] = useState(() => {
    const saved = localStorage.getItem('member') || localStorage.getItem('fitzone_member');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('role') || localStorage.getItem('fitzone_role') || 'member');

  const login = (memberData, authToken, userRole = 'member') => {
    setMember(memberData);
    setToken(authToken);
    setRole(userRole);

    localStorage.setItem('token', authToken);
    localStorage.setItem('member', JSON.stringify(memberData));
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setMember(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem('token');
    localStorage.removeItem('member');
    localStorage.removeItem('role');
    localStorage.removeItem('fitzone_token');
    localStorage.removeItem('fitzone_member');
    localStorage.removeItem('fitzone_role');
  };

  return (
    <AuthContext.Provider value={{ member, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
