export default function BlogsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-20 bg-muted/30" />
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-10">
        <div className="text-center space-y-4">
          <div className="h-8 w-40 rounded-full bg-muted/40 mx-auto" />
          <div className="h-16 w-2/3 rounded-xl bg-muted/40 mx-auto" />
          <div className="h-12 w-96 rounded-xl bg-muted/30 mx-auto" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-muted/30" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-muted/30" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
