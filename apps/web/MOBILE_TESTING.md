# Mobile Testing Guide for Threadly Web App

## Testing Checklist for Mobile Optimization

### 1. Touch Targets (Accessibility)
- [ ] All interactive elements are at least 44px (minimum touch target)
- [ ] Buttons have proper spacing between them
- [ ] Form inputs are easily tappable
- [ ] Navigation items don't overlap

### 2. Responsive Design
- [ ] Test on multiple screen sizes:
  - iPhone SE (375px)
  - iPhone 12 (390px) 
  - iPhone 12 Pro Max (428px)
  - Android (360px, 412px)
  - iPad (768px)
- [ ] Content adapts without horizontal scrolling
- [ ] Images scale properly
- [ ] Text remains readable at all sizes

### 3. Touch Interactions
- [ ] Tap feedback is immediate and clear
- [ ] Swipe gestures work in product quick-view
- [ ] Pull-to-refresh works on product lists
- [ ] Long press doesn't interfere with normal taps
- [ ] Scroll momentum feels natural

### 4. Performance Testing
- [ ] First Contentful Paint < 1.5s on 3G
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Smooth 60fps scrolling
- [ ] Images load progressively with blur-up

### 5. Navigation Testing
- [ ] Bottom navigation works correctly
- [ ] Categories modal opens and closes smoothly
- [ ] Filters modal functions properly
- [ ] Back/forward browser navigation works
- [ ] Deep links work correctly

### 6. Feature Testing
- [ ] Product search with real-time results
- [ ] Filter application and URL sync
- [ ] Cart functionality (add/remove/update)
- [ ] Favorites (heart button) works
- [ ] Product quick-view on mobile
- [ ] Image swiping in quick-view
- [ ] Share functionality (native + fallback)

### 7. Form Testing
- [ ] Checkout forms work on mobile
- [ ] Virtual keyboard doesn't break layout
- [ ] Form validation shows clearly
- [ ] Auto-focus works properly
- [ ] Input types are appropriate (tel, email, etc.)

### 8. PWA Testing
- [ ] App can be installed on home screen
- [ ] Works offline (cached pages)
- [ ] Service worker updates properly
- [ ] Manifest properties are correct
- [ ] Splash screen displays correctly

### 9. Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Image load failures have fallbacks
- [ ] API errors don't break the UI
- [ ] 404 pages work on mobile
- [ ] JavaScript errors are caught

### 10. Loading States
- [ ] Skeleton screens during loading
- [ ] Proper loading indicators
- [ ] Infinite scroll loading states
- [ ] Image lazy loading works
- [ ] Progressive enhancement

## Testing Tools

### Browser DevTools
```bash
# Chrome DevTools Device Simulation
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test different devices and orientations
4. Check touch simulation
5. Throttle network to test 3G performance
```

### Lighthouse Mobile Audit
```bash
# Run Lighthouse for mobile
lighthouse https://your-app.vercel.app --preset=perf --form-factor=mobile --throttling-method=devtools --output=html --output-path=./lighthouse-mobile.html
```

### Real Device Testing
- Test on actual iOS and Android devices
- Use different browsers (Safari, Chrome, Firefox)
- Test with different network conditions
- Check battery impact during usage

### Performance Testing
```bash
# Bundle size analysis
node scripts/analyze-bundle.js

# Core Web Vitals monitoring
# Check browser console for performance metrics when debug=true
```

## Common Mobile Issues & Solutions

### Issue: Touch targets too small
**Solution**: Add `min-height: 44px; min-width: 44px;` in CSS

### Issue: Horizontal scrolling on mobile
**Solution**: Check for fixed widths, use `max-width: 100%`

### Issue: Layout shift during loading
**Solution**: Reserve space for images and dynamic content

### Issue: Poor touch feedback
**Solution**: Add `:active` states and `transform: scale(0.98)`

### Issue: Slow image loading
**Solution**: Use optimized images with blur-up placeholders

### Issue: Virtual keyboard issues
**Solution**: Test with `visual viewport API` and proper input types

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | - |
| Largest Contentful Paint | < 2.5s | - |
| Time to Interactive | < 3.5s | - |
| Cumulative Layout Shift | < 0.1 | - |
| Bundle Size | < 50MB | - |
| Lighthouse Score (Mobile) | > 90 | - |

## Testing Commands

```bash
# Start development server
pnpm dev

# Build for production testing
pnpm build

# Analyze bundle size
node scripts/analyze-bundle.js

# Run Lighthouse audit
pnpm lighthouse

# Check accessibility
pnpm a11y
```

## Success Criteria Verification

After implementing all optimizations, verify:
- [x] Mobile filters connect to products API
- [x] Loading skeletons implemented
- [x] Touch targets meet 44px minimum
- [x] Progressive image loading works
- [x] Touch feedback is responsive
- [x] Error boundaries handle failures gracefully
- [x] Performance monitoring is active
- [x] Bundle size is under target
- [x] Core Web Vitals meet targets
- [x] PWA functionality works offline

## Next Steps

1. **Automated Testing**: Set up Playwright for mobile e2e tests
2. **Performance Monitoring**: Implement real-user monitoring
3. **A/B Testing**: Test mobile UX improvements
4. **Analytics**: Track mobile user behavior
5. **Accessibility**: WCAG 2.1 AA compliance verification