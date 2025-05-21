const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantStyles = {
    primary: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 dark:bg-green-600 dark:hover:bg-green-700',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-700',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${disabledStyles}
    ${widthStyles}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
