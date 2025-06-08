import React from 'react';
import LoginHeader from '../../components/Login/LoginHeader/LoginHeader';
import LoginForm from '../../components/Login/LoginForm/LoginForm';
import './Login.css';

const Login = () => {
  const handleLogin = credentials => {
    // TODO: implementar chamada à API de autenticação
    console.log('Tentando logar com:', credentials);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <LoginHeader />
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default Login;
