const Loader = ({ size = 'md', color = 'green', fullScreen = false, text = 'Carregando...' }) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };
  
  const colorStyles = {
    green: 'border-green-500',
    blue: 'border-blue-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    gray: 'border-gray-500',
  };
  
  const spinnerClasses = `
    inline-block rounded-full
    border-solid border-current border-r-transparent
    animate-spin
    ${sizeStyles[size] || sizeStyles.md}
    ${colorStyles[color] || colorStyles.green}
  `;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClasses}></div>
          {text && <p className="mt-4 text-gray-700 dark:text-gray-300">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className={spinnerClasses}></div>
      {text && <p className="ml-3 text-gray-700 dark:text-gray-300">{text}</p>}
    </div>
  );
};

export default Loader;
