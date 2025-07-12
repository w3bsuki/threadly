export default function PublicTestPage(): React.JSX.Element {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Public Test Page</h1>
      <p>This page is outside the (authenticated) group.</p>
      <div className="mt-4 space-y-2">
        <div>Environment: {process.env.NODE_ENV}</div>
        <div>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</div>
        <div>Clerk Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}</div>
      </div>
    </div>
  );
}