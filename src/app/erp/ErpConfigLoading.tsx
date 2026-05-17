export default function ErpConfigLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
          <div>
            <div className="h-4 w-44 rounded-full bg-gray-200" />
            <div className="mt-2 h-3 w-32 rounded-full bg-gray-100" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 rounded-full bg-gray-100" />
          <div className="h-3 w-10/12 rounded-full bg-gray-100" />
          <div className="h-3 w-7/12 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
