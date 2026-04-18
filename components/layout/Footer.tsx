export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="px-10 py-6 flex flex-col md:flex-row justify-between gap-2">
        <span className="metric-label">
          © {new Date().getFullYear()} Global Assets Clearing Corp. All rights reserved.
        </span>
        <span className="metric-label">
          Brokerage services involve risk. Past performance does not guarantee future results. Ref. GB-001.
        </span>
      </div>
    </footer>
  );
}
