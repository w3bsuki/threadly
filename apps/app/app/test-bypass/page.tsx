// Test page OUTSIDE the (authenticated) layout to bypass all the layout logic
export default function TestBypassPage(): React.JSX.Element {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧪 Bypass Test</h1>
      <p>This page is OUTSIDE the (authenticated) layout.</p>
      <p>If this works but /selling pages don't, the issue is in the authenticated layout.</p>
      <p>If this also fails, the issue is deeper (root layout or build).</p>
    </div>
  );
}