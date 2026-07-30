export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-20 bg-muted/30" />
      <div className="max-w-7xl mx-auto px-4 py-32 space-y-16">
        <div className="space-y-4 text-center">
          <div className="h-8 w-48 rounded-full bg-muted/40 mx-auto" />
          <div className="h-16 w-3/4 rounded-xl bg-muted/40 mx-auto" />
          <div className="h-6 w-2/3 rounded-lg bg-muted/30 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
