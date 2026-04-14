"use client";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "1.5rem",
        fontWeight: 700,
        fontStyle: "italic",
        cursor: "pointer",
        color: "var(--ink)",
      }}
    >
      Folio
    </span>
  );
}

export { Logo };
