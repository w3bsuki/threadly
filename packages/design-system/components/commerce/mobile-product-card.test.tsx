import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileProductCard, MobileProductCardSkeleton } from './mobile-product-card'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}))

// Mock navigator.vibrate
beforeEach(() => {
  global.navigator.vibrate = jest.fn()
})

describe('MobileProductCard', () => {
  const defaultProps = {
    id: 'test-1',
    title: 'Test Product',
    price: 29.99,
    imageUrl: 'https://example.com/image.jpg',
    onAddToCart: jest.fn(),
    onToggleWishlist: jest.fn(),
    onQuickBuy: jest.fn(),
    onQuickPreview: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<MobileProductCard {...defaultProps} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Test Product' })).toBeInTheDocument()
  })

  it('displays original price with strikethrough when provided', () => {
    render(<MobileProductCard {...defaultProps} originalPrice={49.99} />)
    
    expect(screen.getByText('$49.99')).toHaveClass('line-through')
  })

  it('shows discount badge when original price is higher', () => {
    render(<MobileProductCard {...defaultProps} price={30} originalPrice={50} />)
    
    expect(screen.getByText('-40%')).toBeInTheDocument()
  })

  it('displays sold out overlay when not in stock', () => {
    render(<MobileProductCard {...defaultProps} inStock={false} />)
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument()
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('shows size selector when clicking add to cart without selected size', async () => {
    const user = userEvent.setup()
    render(<MobileProductCard {...defaultProps} sizes={['S', 'M', 'L']} />)
    
    await user.click(screen.getByText('Add to Cart'))
    
    expect(screen.getByText('Select Size')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('calls onAddToCart with selected size', async () => {
    const user = userEvent.setup()
    render(<MobileProductCard {...defaultProps} sizes={['S', 'M', 'L']} />)
    
    await user.click(screen.getByText('Add to Cart'))
    await user.click(screen.getByText('M'))
    
    expect(defaultProps.onAddToCart).toHaveBeenCalledWith('test-1', 'M')
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
  })

  it('shows quick buy button when saved size exists', () => {
    render(<MobileProductCard {...defaultProps} savedSize="M" />)
    
    expect(screen.getByRole('button', { name: /quick buy/i })).toBeInTheDocument()
  })

  it('calls onQuickBuy with saved size', async () => {
    const user = userEvent.setup()
    render(<MobileProductCard {...defaultProps} savedSize="M" />)
    
    await user.click(screen.getByRole('button', { name: /quick buy/i }))
    
    expect(defaultProps.onQuickBuy).toHaveBeenCalledWith('test-1', 'M')
    expect(navigator.vibrate).toHaveBeenCalledWith(15)
  })

  it('toggles wishlist state', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MobileProductCard {...defaultProps} isWishlisted={false} />)
    
    const wishlistButton = screen.getByRole('button', { name: /wishlist/i })
    await user.click(wishlistButton)
    
    expect(defaultProps.onToggleWishlist).toHaveBeenCalledWith('test-1')
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
    
    // Test visual state when wishlisted
    rerender(<MobileProductCard {...defaultProps} isWishlisted={true} />)
    expect(wishlistButton.querySelector('svg')).toHaveClass('fill-pink-500')
  })

  it('disables add to cart when out of stock', () => {
    render(<MobileProductCard {...defaultProps} inStock={false} />)
    
    expect(screen.getByText('Out of Stock')).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MobileProductCard {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles long press for size selector', async () => {
    jest.useFakeTimers()
    render(<MobileProductCard {...defaultProps} sizes={['S', 'M', 'L']} />)
    
    const image = screen.getByRole('img')
    fireEvent.touchStart(image)
    
    jest.advanceTimersByTime(500)
    
    await waitFor(() => {
      expect(screen.getByText('Select Size')).toBeInTheDocument()
    })
    
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
    
    jest.useRealTimers()
  })

  it('cancels long press on touch end', () => {
    jest.useFakeTimers()
    render(<MobileProductCard {...defaultProps} sizes={['S', 'M', 'L']} />)
    
    const image = screen.getByRole('img')
    fireEvent.touchStart(image)
    fireEvent.touchEnd(image)
    
    jest.advanceTimersByTime(600)
    
    expect(screen.queryByText('Select Size')).not.toBeInTheDocument()
    
    jest.useRealTimers()
  })
})

describe('MobileProductCardSkeleton', () => {
  it('renders skeleton loading state', () => {
    render(<MobileProductCardSkeleton />)
    
    const skeletons = screen.getAllByTestId(/skeleton/i)
    expect(skeletons).toHaveLength(4) // Image, title, price, button
  })
})