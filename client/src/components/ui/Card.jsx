import React from "react";

/**
 * Simple Card component
 * Usage: <Card><CardContent>...</CardContent></Card>
 */
export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
