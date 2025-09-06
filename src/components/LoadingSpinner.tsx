export function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      <p className="mt-4 text-emerald-600 font-medium">Chargement...</p>
    </div>
  )
}