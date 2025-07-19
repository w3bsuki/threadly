import type { Meta, StoryObj } from '@storybook/react';
import {
  Header,
  HeaderBase,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  MobileMenu,
  MenuButton,
  MobileNav,
  StickyHeader,
  MobileDrawerNav,
} from '@repo/design-system/components/navigation';
import { Button } from '@repo/design-system/components';
import { 
  ShoppingCart, 
  Heart, 
  Bell, 
  User,
  Home,
  Search,
  ShoppingBag,
  MessageCircle,
  LayoutDashboard,
  Package,
  Settings,
} from 'lucide-react';

const meta = {
  title: 'Navigation/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockActions = (
  <>
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
    </Button>
    <Button variant="ghost" size="icon">
      <Heart className="h-5 w-5" />
    </Button>
    <Button variant="ghost" size="icon">
      <ShoppingCart className="h-5 w-5" />
    </Button>
    <Button variant="ghost" size="icon">
      <User className="h-5 w-5" />
    </Button>
  </>
);

const mockDrawerContent = (
  <MobileDrawerNav
    sections={[
      {
        title: 'Main Navigation',
        items: [
          { label: 'Dashboard', href: '#', icon: LayoutDashboard },
          { label: 'Products', href: '#', icon: Package },
          { label: 'Messages', href: '#', icon: MessageCircle, badge: 3 },
          { label: 'Settings', href: '#', icon: Settings },
        ],
      },
      {
        title: 'Categories',
        items: [
          { 
            label: 'Women', 
            href: '#',
            children: [
              { label: 'Dresses', href: '#' },
              { label: 'Tops', href: '#' },
              { label: 'Bottoms', href: '#' },
            ],
          },
          { 
            label: 'Men', 
            href: '#',
            children: [
              { label: 'Shirts', href: '#' },
              { label: 'Pants', href: '#' },
              { label: 'Shoes', href: '#' },
            ],
          },
          { label: 'Kids', href: '#' },
          { label: 'Accessories', href: '#' },
        ],
      },
    ]}
    header={
      <div>
        <h2 className="text-lg font-semibold">Menu</h2>
        <p className="text-sm text-muted-foreground">Navigate Threadly</p>
      </div>
    }
    footer={
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">Settings</Button>
        <Button variant="outline" size="sm">Sign Out</Button>
      </div>
    }
  />
);

export const Default: Story = {
  args: {
    logo: {
      text: 'Threadly',
      href: '#',
    },
    search: {
      placeholder: 'Search products, brands, or members...',
    },
    actions: <HeaderActions>{mockActions}</HeaderActions>,
    mobileMenuContent: mockDrawerContent,
  },
};

export const WithoutSearch: Story = {
  args: {
    logo: {
      text: 'Threadly',
      href: '#',
    },
    actions: <HeaderActions>{mockActions}</HeaderActions>,
    mobileMenuContent: mockDrawerContent,
  },
};

export const Transparent: Story = {
  args: {
    ...Default.args,
    className: 'bg-transparent border-0',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
        <Story />
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4">Transparent Header</h1>
          <p>The header above has a transparent background.</p>
        </div>
      </div>
    ),
  ],
};

export const WithStickyBehavior: Story = {
  decorators: [
    (Story) => (
      <div>
        <StickyHeader>
          <Header {...Default.args} />
        </StickyHeader>
        <div className="p-8 space-y-4">
          <h1 className="text-4xl font-bold mb-4">Sticky Header Demo</h1>
          <p>Scroll down to see the header hide and show behavior.</p>
          {Array.from({ length: 50 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
    ),
  ],
};

export const MobileNavigation: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background pb-20">
        <Header {...Default.args} />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Mobile Navigation</h1>
          <p>The bottom navigation is shown on mobile devices.</p>
        </div>
        <MobileNav
          items={[
            { label: 'Home', href: '#', icon: Home },
            { label: 'Search', href: '#', icon: Search },
            { label: 'Shop', href: '#', icon: ShoppingBag, badge: 2 },
            { label: 'Messages', href: '#', icon: MessageCircle, badge: 5 },
            { label: 'Profile', href: '#', icon: User },
          ]}
          currentPath="#"
        />
      </div>
    ),
  ],
};

export const HeaderComponents: Story = {
  decorators: [
    (Story) => (
      <div className="space-y-8 p-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Header Base</h3>
          <HeaderBase>
            <div className="flex items-center justify-between w-full">
              <span>Header Base Component</span>
              <span>Right Content</span>
            </div>
          </HeaderBase>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Header Logo</h3>
          <div className="flex gap-4">
            <HeaderLogo />
            <HeaderLogo logoText="Custom" />
            <HeaderLogo showFullText={false} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Menu Button</h3>
          <div className="flex gap-4">
            <MenuButton />
            <MenuButton isOpen />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Header Search</h3>
          <div className="space-y-4">
            <HeaderSearch placeholder="Default search..." />
            <HeaderSearch variant="minimal" placeholder="Minimal search..." />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Header Actions</h3>
          <div className="space-y-4">
            <HeaderActions spacing="tight">{mockActions}</HeaderActions>
            <HeaderActions spacing="normal">{mockActions}</HeaderActions>
            <HeaderActions spacing="loose">{mockActions}</HeaderActions>
          </div>
        </div>
      </div>
    ),
  ],
};