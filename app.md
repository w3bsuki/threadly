# app.md

Seller Dashboard (/apps/app) - Mobile-first admin dashboard for perfect mobile experience.

## CURRENT FEATURES
- **Dashboard**: Real-time metrics, mobile-responsive stats
- **Inventory**: Product management with bulk operations
- **Orders**: Tracking and fulfillment
- **Analytics**: Comprehensive metrics and insights
- **Reviews**: Mobile-first with photos and voting
- **Financial**: P&L, tax reports, expense tracking
- **Marketing**: Discounts, featured listings, ROI tracking

## MOBILE-FIRST ADMIN DASHBOARD ARCHITECTURE

### Core Navigation System
**shadcn/ui Sidebar with Mobile Optimization**
```typescript
<SidebarProvider>
  <Sidebar 
    collapsible="offcanvas" // Mobile overlay behavior
    variant="floating" // Modern design
    side="left"
  >
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="h-12"> // 44px+ touch target
            <ThreadlyLogo className="size-8" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Threadly Admin</span>
              <span className="truncate text-xs">Fashion Dashboard</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Core</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12"> // Touch-optimized
              <BarChart3 className="size-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          // Additional menu items...
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    {/* Main content area */}
  </SidebarInset>
</SidebarProvider>
```

### Mobile Dashboard Layout
**Responsive Grid System**
```typescript
// Mobile-first dashboard grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <Card className="col-span-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">$45,231.89</div>
      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
    </CardContent>
  </Card>
  
  // Mobile-optimized metric cards
  <Card className="col-span-1 sm:col-span-2"> // Responsive spanning
    <CardHeader>
      <CardTitle className="text-base">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="h-10 flex-1 min-w-[120px]">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
        <Button size="sm" variant="outline" className="h-10 flex-1 min-w-[120px]">
          <Package className="mr-2 h-4 w-4" />
          View Orders
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
```

### Progressive Data Tables
**Mobile-First Data Display**
```typescript
// Responsive data table with mobile cards
<div className="space-y-4">
  {/* Desktop table */}
  <div className="hidden md:block">
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Table rows */}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  
  {/* Mobile card view */}
  <div className="block md:hidden space-y-4">
    {products.map((product) => (
      <Card key={product.id} className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={product.image} alt={product.name} />
              <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${product.price}</p>
            <Badge variant="outline">{product.status}</Badge>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="h-10 flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="outline" className="h-10 flex-1">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      </Card>
    ))}
  </div>
</div>
```

### Mobile Form Patterns
**Multi-Step Product Wizard**
```typescript
const ProductWizard = () => {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    { title: "Basic Info", component: BasicInfoForm },
    { title: "Photos", component: PhotoUploadForm },
    { title: "Pricing", component: PricingForm },
    { title: "Review", component: ReviewForm },
  ]
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex-1 h-2 rounded-full mx-1 ${
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      {/* Current step content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <steps[currentStep].component />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="h-12"
          >
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="h-12"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Mobile Analytics Dashboard
**Touch-Optimized Charts**
```typescript
// Mobile-responsive chart container
<div className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Revenue Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
  
  {/* Mobile metrics grid */}
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
    <Card className="p-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">124</div>
        <div className="text-sm text-muted-foreground">Orders</div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">$12.4K</div>
        <div className="text-sm text-muted-foreground">Revenue</div>
      </div>
    </Card>
    // Additional metric cards...
  </div>
</div>
```

## MOBILE UX ENHANCEMENTS

### Touch Interactions
- **Swipe Actions**: Implement swipe-to-delete/edit on mobile cards
- **Pull-to-Refresh**: Add refresh functionality on dashboard
- **Haptic Feedback**: Implement tactile responses for actions
- **Touch Gestures**: Pinch-to-zoom on charts, double-tap actions

### Progressive Disclosure
- **Collapsible Sections**: Use Accordion for detailed views
- **Sheet Overlays**: Implement Sheet for detailed forms
- **Drawer Navigation**: Bottom drawer for quick actions
- **Modal Hierarchy**: Layer information appropriately

### Performance Optimization
- **Lazy Loading**: Implement for data tables and charts
- **Virtual Scrolling**: For large product lists
- **Debounced Search**: Optimize search inputs
- **Optimistic Updates**: Immediate UI feedback

## CRITICAL FIXES NEEDED

### 1. Navigation Consolidation (HIGH)
- **Replace**: Two conflicting navigation systems
- **Implement**: Single shadcn/ui Sidebar with offcanvas mode
- **Ensure**: 44px+ touch targets throughout
- **Files**: `mobile-bottom-nav.tsx` → `admin-sidebar.tsx`

### 2. Responsive Layout Overhaul (HIGH)
- **Fix**: Stats cards cutoff on mobile
- **Implement**: CSS Grid with mobile-first breakpoints
- **Remove**: Max-height constraints causing issues
- **Add**: Progressive card layouts for mobile

### 3. Touch-Optimized Forms (HIGH)
- **Implement**: Multi-step product wizard
- **Add**: Touch-friendly form controls
- **Ensure**: Proper keyboard navigation
- **Include**: Real-time validation feedback

## DESIGN PRINCIPLES

### Mobile-First Approach
- Start with 320px viewport
- Progressive enhancement for larger screens
- Touch targets minimum 44px
- Thumb-friendly interaction zones

### Clean Black/White Aesthetic
- Consistent with brand guidelines
- High contrast for readability
- Minimal color palette
- Focus on content hierarchy

### Performance Standards
- Core Web Vitals compliance
- Sub-200ms interaction responses
- Smooth 60fps animations
- Efficient data loading

## DEVELOPMENT NOTES
- Use shadcn/ui Sidebar component exclusively
- Implement responsive breakpoints: xs(480px), sm(640px), md(768px), lg(1024px)
- Server Components by default with client components for interactions
- Include DB relations upfront to avoid N+1 queries
- Use cache.remember() for Redis caching
- Run pnpm typecheck after all changes
- Follow existing patterns in Storybook

## SUCCESS METRICS
- Mobile conversion: +25%
- Seller retention: +40% 
- Listing time: -60%
- Revenue per seller: +35%
- Mobile task completion: +50%
- User satisfaction: 4.8/5.0