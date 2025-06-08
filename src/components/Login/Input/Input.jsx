import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <input
      className="input-field"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;
