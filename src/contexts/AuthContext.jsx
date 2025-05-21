import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Usando auth state simples sem lógica de autenticação por agora
  const [user, setUser] = useState({
    id: 'default-user',
    name: 'Usuário do Sistema',
    role: 'operator',
    station: 'station-1',
  });

  // Login inicial simples
  const login = (userData) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
