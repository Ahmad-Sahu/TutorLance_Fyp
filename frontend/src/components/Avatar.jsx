import React from "react";

/** Shows profile picture or initials (e.g. "Ubaid Zaffar" → "UZ") in a circle */
export default function Avatar({ src, firstName, lastName, className = "", size = "md" }) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((s) => (s || "").charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "?";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl",
  };
  const s = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ""} ${lastName || ""}`.trim() || "Profile"}
        className={`rounded-full object-cover ${s} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold ${s} ${className}`}
      title={`${firstName || ""} ${lastName || ""}`.trim()}
    >
      {initials}
    </div>
  );
}
