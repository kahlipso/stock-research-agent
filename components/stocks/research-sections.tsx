const sections = ["Investment thesis", "Bull case", "Base case", "Bear case", "Competitive advantages", "Growth drivers", "Catalysts", "Risks", "Thesis-invalidating conditions", "Desired entry conditions"];
export function ResearchSections() {
  return <section><h2 className="text-xl font-bold">Research workspace</h2><p className="mt-1 text-sm muted">Structured placeholders for a future analysis milestone. No AI analysis has been performed.</p><div className="mt-4 grid gap-4 md:grid-cols-2">{sections.map((title) => <article key={title} className="panel min-h-28 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm italic text-[var(--muted)]">Not yet analyzed.</p></article>)}</div></section>;
}
