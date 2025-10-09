import React from 'react';
import './ButtonLogin.css';

const ButtonLogin = ({ children, ...props }) => (
  <button className="button-login" {...props}>
    {children}
  </button>
);

export default ButtonLogin;
