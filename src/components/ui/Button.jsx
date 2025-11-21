/**
 * Button UI Component
 */

export const Button = ({ children, className = "", variant = "default", onClick, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
      variant === "outline" 
        ? "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300" 
        : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow"
    } ${className}`} 
    onClick={onClick} 
    {...props}
  >
    {children}
  </button>
);