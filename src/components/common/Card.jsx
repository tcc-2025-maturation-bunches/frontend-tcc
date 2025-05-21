const Card = ({
  children,
  title,
  subtitle,
  className = '',
  bodyClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  footer,
  footerClassName = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className={`text-lg font-medium leading-6 text-gray-900 dark:text-white ${titleClassName}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 ${subtitleClassName}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
