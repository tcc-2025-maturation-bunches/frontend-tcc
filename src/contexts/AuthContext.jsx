import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, verifyToken, getCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      await verifyToken();
      const userData = await getCurrentUser();
      
      const normalizedUser = {
        id: userData.user_id,
        user_id: userData.user_id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        role: userData.user_type,
        user_type: userData.user_type
      };
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      
      if (!response.access_token) {
        throw new Error('Token de acesso não retornado');
      }
      
      localStorage.setItem('access_token', response.access_token);
      
      const userData = await getCurrentUser();
      
      if (!userData || !userData.user_id) {
        throw new Error('Dados do usuário não retornados');
      }
      
      const normalizedUser = {
        id: userData.user_id,
        user_id: userData.user_id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        role: userData.user_type,
        user_type: userData.user_type
      };
      
      localStorage.setItem('user_data', JSON.stringify(normalizedUser));
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response?.status === 401) {
        errorMessage = 'Usuário ou senha inválidos';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acesso negado';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isAuthenticated,
      checkAuth 
    }}>
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
