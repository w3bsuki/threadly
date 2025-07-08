// Ultra-simple selling page without any complex logic
export default function SimpleSellPage() {
  return (
    <div className="p-8">
      <h1>Simple Sell Page</h1>
      <p>This is a basic page with no server actions, no database calls, no auth.</p>
      <p>If this works, the issue is in the server logic.</p>
      <p>If this fails, the issue is in the route structure or build.</p>
    </div>
  );
}