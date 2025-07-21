✅ App build progress - fixing React type inference issues

Fixed components (Round 1):
- loading.tsx: Added React.FC type annotation
- page.tsx (health): Added React.FC type annotation  
- layout.tsx (admin): Added React.FC type annotation with proper interface

Fixed components (Round 2):
- AdminDashboard page: Added React.FC type annotation
- AdminProductsPage: Added React.FC<PageProps> type annotation
- AdminReportsPage: Added React.FC type annotation
- AdminUsersPage: Added React.FC<PageProps> type annotation

All admin pages now have explicit type annotations.
Pushing to trigger next Vercel build...
