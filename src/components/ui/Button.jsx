/**
 * Button UI Component
 */

export const Button = ({ children, className = "", variant = "default", onClick, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium inline-flex items-center gap-2 ${
      variant === "outline" ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"
    } ${className}`} 
    onClick={onClick} 
    {...props}
  >
    {children}
  </button>
);