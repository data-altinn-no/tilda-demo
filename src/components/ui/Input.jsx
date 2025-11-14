/**
 * Input UI Component
 */

export const Input = ({ className = "", ...props }) => (
  <input 
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} 
    {...props} 
  />
);