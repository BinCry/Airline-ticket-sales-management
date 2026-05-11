export default function SearchLoading() {
  return (
    <section className="section">
      <div className="container stack-list">
        <div className="page-hero-card skeleton-card">
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line skeleton-line-short" />
        </div>
        <div className="search-layout">
          <aside className="surface-card skeleton-card">
            <div className="skeleton-block skeleton-title skeleton-title-small" />
            <div className="filter-chip-list">
              <span className="assurance-chip skeleton-chip">Đang tải...</span>
              <span className="assurance-chip skeleton-chip">Đang tải...</span>
              <span className="assurance-chip skeleton-chip">Đang tải...</span>
            </div>
          </aside>
          <div className="stack-list">
            {Array.from({ length: 2 }).map((_, index) => (
              <article key={index} className="surface-card result-card skeleton-card">
                <div className="skeleton-block skeleton-title" />
                <div className="skeleton-block skeleton-line" />
                <div className="skeleton-block skeleton-line skeleton-line-short" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
