import React from "react";
import clsx from "clsx";

/**
 * Simple reusable Button component
 * variant = "default" | "outline" | "ghost"
 */
export const Button = ({ 
  children, 
  variant = "default", 
  className = "", 
  ...props 
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2",
    ghost: "text-gray-700 hover:bg-gray-100 px-3 py-2",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
