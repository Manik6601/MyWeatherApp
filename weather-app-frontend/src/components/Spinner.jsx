import React from "react";

/**
 * Simple centered spinner. Styling is in src/index.css
 */
export default function Spinner() {
  return (
    <div className="spinner-wrapper" aria-hidden="true">
      <div className="spinner" />
    </div>
  );
}
