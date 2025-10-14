import React, { useState } from 'react';
import Input from '../Input/Input';
import ButtonLogin from '../ButtonLogin/ButtonLogin';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    onLogin({ username: username.trim(), password });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <Input
        label="Usuário"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Digite seu usuário"
      />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Digite sua senha"
      />
      <ButtonLogin type="submit">Entrar</ButtonLogin>
    </form>
  );
};

export default LoginForm;
