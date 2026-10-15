import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h2 className="text-xl font-bold tracking-[-0.02em] text-dune-900 dark:text-dune-100">Page not found</h2>
      <p className="mt-2 text-xs text-dune-500">The requested page could not be found.</p>
      <Link href="/" className="btn-primary mt-5">
        ← Back to home
      </Link>
    </div>
  );
}
