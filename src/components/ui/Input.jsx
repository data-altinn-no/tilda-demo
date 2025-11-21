/**
 * Input UI Component
 */

export const Input = ({ className = "", ...props }) => (
  <input 
    className={`px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 ${className}`} 
    {...props} 
  />
);