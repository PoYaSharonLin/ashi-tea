export default function ProductsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/50 via-muted/25 to-background">
      <main className="flex flex-1 items-center justify-center py-10">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
            role="status"
            aria-label="載入中"
          />
          <p className="text-sm text-muted-foreground">載入商品中...</p>
        </div>
      </main>
    </div>
  );
}
