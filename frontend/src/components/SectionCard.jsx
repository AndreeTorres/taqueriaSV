export const SectionCard = ({ title, children, actions }) => (
  <div
    style={{
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "1.2rem",
      marginBottom: "1.5rem",
    }}
  >
    {title && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {actions && <div style={{ display: "flex", gap: "0.5rem" }}>{actions}</div>}
      </div>
    )}
    {children}
  </div>
);
