interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="container page stack gap-lg" style={{ maxWidth: 760 }}>
      <div className="stack gap-sm">
        <h1>{title}</h1>
        <p className="muted" style={{ fontSize: 13 }}>Last updated {updated}</p>
      </div>
      <div className="form-error" role="note">
        This is placeholder boilerplate, not reviewed by a lawyer. Replace with counsel-reviewed
        language before treating it as binding.
      </div>
      <div className="stack gap-md" style={{ fontSize: 15, lineHeight: 1.7, color: "var(--espresso)" }}>
        {children}
      </div>
    </div>
  );
}
