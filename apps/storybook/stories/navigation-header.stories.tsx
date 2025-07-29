import { Button } from '@repo/ui/components';
import {
  Header,
  HeaderActions,
  HeaderBase,
  HeaderLogo,
  HeaderSearch,
  MenuButton,
  MobileDrawerNav,
  MobileMenu,
  MobileNav,
  StickyHeader,
} from '@repo/ui/components/navigation';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Bell,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
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
    <Button size="icon" variant="ghost">
      <Bell className="h-5 w-5" />
    </Button>
    <Button size="icon" variant="ghost">
      <Heart className="h-5 w-5" />
    </Button>
    <Button size="icon" variant="ghost">
      <ShoppingCart className="h-5 w-5" />
    </Button>
    <Button size="icon" variant="ghost">
      <User className="h-5 w-5" />
    </Button>
  </>
);

const mockDrawerContent = (
  <MobileDrawerNav
    footer={
      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline">
          Settings
        </Button>
        <Button size="sm" variant="outline">
          Sign Out
        </Button>
      </div>
    }
    header={
      <div>
        <h2 className="font-semibold text-lg">Menu</h2>
        <p className="text-muted-foreground text-sm">Navigate Threadly</p>
      </div>
    }
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
          <h1 className="mb-4 font-bold text-4xl">Transparent Header</h1>
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
        <div className="space-y-4 p-8">
          <h1 className="mb-4 font-bold text-4xl">Sticky Header Demo</h1>
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
          <h1 className="mb-4 font-bold text-2xl">Mobile Navigation</h1>
          <p>The bottom navigation is shown on mobile devices.</p>
        </div>
        <MobileNav
          currentPath="#"
          items={[
            { label: 'Home', href: '#', icon: Home },
            { label: 'Search', href: '#', icon: Search },
            { label: 'Shop', href: '#', icon: ShoppingBag, badge: 2 },
            { label: 'Messages', href: '#', icon: MessageCircle, badge: 5 },
            { label: 'Profile', href: '#', icon: User },
          ]}
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
          <h3 className="mb-4 font-semibold text-lg">Header Base</h3>
          <HeaderBase>
            <div className="flex w-full items-center justify-between">
              <span>Header Base Component</span>
              <span>Right Content</span>
            </div>
          </HeaderBase>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-lg">Header Logo</h3>
          <div className="flex gap-4">
            <HeaderLogo />
            <HeaderLogo logoText="Custom" />
            <HeaderLogo showFullText={false} />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-lg">Menu Button</h3>
          <div className="flex gap-4">
            <MenuButton />
            <MenuButton isOpen />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-lg">Header Search</h3>
          <div className="space-y-4">
            <HeaderSearch placeholder="Default search..." />
            <HeaderSearch placeholder="Minimal search..." variant="minimal" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-lg">Header Actions</h3>
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
