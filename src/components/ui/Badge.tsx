/**
 * Badge UI Component
 */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary";
}

export const Badge = ({ children, className = "", variant = "default", ...props }: BadgeProps) => (
  <span 
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === "secondary" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
    } ${className}`} 
    {...props}
  >
    {children}
  </span>
);
