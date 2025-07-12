// Minimal test page to isolate the server component error
import { currentUser } from '@repo/auth/server';

export default async function TestMinimalPage(): Promise<React.JSX.Element> {
  try {
    // Test 1: Basic auth
    const user = await currentUser();
    
    if (!user) {
      return <div>No user - please sign in</div>;
    }

    // Test 2: Basic JSX
    return (
      <div className="p-8">
        <h1>✅ Test Page Works!</h1>
        <p>User ID: {user.id}</p>
        <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
        <p>If you see this, auth works fine.</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1>❌ Error Found</h1>
        <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
        <pre>{error instanceof Error ? error.stack : 'No stack'}</pre>
      </div>
    );
  }
}