import { SkeletonGrid } from "./SkeletonGrid";

// Shared loading/error treatments for pages that fetch from the API on
// mount. The backend can take 15-30s to wake up from an idle Render
// instance, so these exist to replace what would otherwise be a blank
// page (or an indefinite spinner) with something branded and a way out.

export function VaultLoading({ message = "Opening the Vault…" }: { message?: string }) {
  return (
    <div className="vault-status">
      <div className="spinner" />
      <p className="muted">{message}</p>
    </div>
  );
}

export function VaultError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="vault-status">
      <p>{message}</p>
      <button className="btn btn-gold" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

// Grid-shaped variants keep the page's own title visible while the
// products load underneath it, instead of replacing the whole page with
// a centered spinner.
export function VaultLoadingGrid({
  title,
  message = "Opening the Vault…",
  count = 8,
  gridClassName,
}: {
  title: string;
  message?: string;
  count?: number;
  gridClassName?: string;
}) {
  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>{title}</h1>
        <p className="muted">{message}</p>
      </div>
      <SkeletonGrid count={count} gridClassName={gridClassName} />
    </div>
  );
}

export function VaultErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div className="container page stack gap-lg">
      <div className="stack gap-sm">
        <h1>{title}</h1>
      </div>
      <VaultError message={message} onRetry={onRetry} />
    </div>
  );
}
