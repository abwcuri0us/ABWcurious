export default function ITSolutionsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-20 bg-muted/30" />
      <div className="max-w-7xl mx-auto px-4 py-32 space-y-12">
        <div className="text-center space-y-4">
          <div className="h-8 w-40 rounded-full bg-muted/40 mx-auto" />
          <div className="h-16 w-3/4 rounded-xl bg-muted/40 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
