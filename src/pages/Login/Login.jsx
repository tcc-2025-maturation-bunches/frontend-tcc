import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginHeader from '../../components/Login/LoginHeader/LoginHeader';
import LoginForm from '../../components/Login/LoginForm/LoginForm';
import Loader from '../../components/common/Loader';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async ({ username, password }) => {
    if (!username.trim() || !password.trim()) {
      const errorMsg = 'Por favor, preencha todos os campos';
      setError(errorMsg);
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(username, password);
      if (result.success) {
        setSuccess('Login realizado com sucesso! Carregando...');
      } else {
        const errorMsg = result.error || 'Usuário ou senha inválidos';
        console.error('Erro no login:', errorMsg);
        setError(errorMsg);
        setSuccess('');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Exceção no login:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao fazer login';
      setError(errorMessage);
      setSuccess('');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <LoginHeader />
        
        {error && !isLoading && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4 animate-fade-in border-l-4 border-red-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-lg">{error}</p>
                <p className="text-sm mt-1">Verifique suas credenciais e tente novamente</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4 animate-fade-in border-l-4 border-green-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-lg">{success}</p>
                <p className="text-sm mt-1">Aguarde enquanto carregamos suas informações...</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-8">
            <Loader text="Autenticando..." />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Por favor, aguarde...
            </p>
          </div>
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Sistema de Análise de Bananas Nanicas v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
