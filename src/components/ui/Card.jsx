/**
 * Card UI Components
 */

export const Card = ({ children, className = "", ...props }) => (
  <div className={`border rounded-lg shadow-sm bg-white p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);