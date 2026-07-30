export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-20 bg-muted/30" />
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-12">
        <div className="text-center space-y-4">
          <div className="h-8 w-40 rounded-full bg-muted/40 mx-auto" />
          <div className="h-16 w-2/3 rounded-xl bg-muted/40 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/30" />
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 h-96 rounded-2xl bg-muted/30" />
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-muted/30" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
