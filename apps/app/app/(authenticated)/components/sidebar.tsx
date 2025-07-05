'use client';

import { UserButton } from '@repo/auth/client';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/design-system/components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { NotificationsTrigger } from '@repo/notifications/components/trigger';
import {
  AnchorIcon,
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  FolderIcon,
  FrameIcon,
  LifeBuoyIcon,
  MapIcon,
  MoreHorizontalIcon,
  PieChartIcon,
  SendIcon,
  Settings2Icon,
  ShareIcon,
  SquareTerminalIcon,
  Trash2Icon,
  ShoppingBagIcon,
  SearchIcon,
  MessageCircleIcon,
  UserIcon,
  PlusIcon,
  HeartIcon,
  StarIcon,
  ShieldIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Search } from './search';
import { CartDropdown } from './cart-dropdown';

type GlobalSidebarProperties = {
  readonly children: ReactNode;
  readonly isAdmin?: boolean;
};

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Browse',
      url: '/search',
      icon: SearchIcon,
      isActive: false,
      items: [
        {
          title: 'All Items',
          url: '/search',
        },
        {
          title: 'Women',
          url: '/search?categories=women',
        },
        {
          title: 'Men',
          url: '/search?categories=men',
        },
        {
          title: 'Kids',
          url: '/search?categories=kids',
        },
      ],
    },
    {
      title: 'Selling',
      url: '/selling',
      icon: PlusIcon,
      items: [
        {
          title: 'Dashboard',
          url: '/selling/dashboard',
        },
        {
          title: 'Seller Onboarding',
          url: '/selling/onboarding',
        },
        {
          title: 'Sell an Item',
          url: '/selling/new',
        },
        {
          title: 'My Listings',
          url: '/selling/listings',
        },
        {
          title: 'Sales History',
          url: '/selling/history',
        },
      ],
    },
    {
      title: 'Buying',
      url: '/buying',
      icon: ShoppingBagIcon,
      items: [
        {
          title: 'My Orders',
          url: '/buying/orders',
        },
        {
          title: 'Favorites',
          url: '/buying/favorites',
        },
        {
          title: 'Cart',
          url: '/buying/cart',
        },
      ],
    },
    {
      title: 'Messages',
      url: '/messages',
      icon: MessageCircleIcon,
      items: [
        {
          title: 'All Messages',
          url: '/messages',
        },
        {
          title: 'Buying',
          url: '/messages?type=buying',
        },
        {
          title: 'Selling',
          url: '/messages?type=selling',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Profile',
      url: '/profile',
      icon: UserIcon,
    },
  ],
  projects: [
    {
      name: 'My Favorites',
      url: '/buying/favorites',
      icon: HeartIcon,
    },
  ],
};

export const GlobalSidebar = ({ children, isAdmin = false }: GlobalSidebarProperties) => {
  const sidebar = useSidebar();
  
  // Add admin section if user is admin
  const navMainWithAdmin = isAdmin ? [
    ...data.navMain,
    {
      title: 'Admin',
      url: '/admin',
      icon: ShieldIcon,
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
        },
        {
          title: 'Users',
          url: '/admin/users',
        },
        {
          title: 'Products',
          url: '/admin/products',
        },
        {
          title: 'Reports',
          url: '/admin/reports',
        },
      ],
    },
  ] : data.navMain;

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={cn(
                  'h-[36px] overflow-hidden transition-all [&>div]:w-full',
                  sidebar.open ? '' : '-mx-1'
                )}
              >
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                  <ShoppingBagIcon className="h-6 w-6" />
                  <span>Threadly</span>
                </Link>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Search />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Marketplace</SidebarGroupLabel>
            <SidebarMenu>
              {navMainWithAdmin.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRightIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Personal</SidebarGroupLabel>
            <SidebarMenu>
              {data.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontalIcon />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuItem>
                        <FolderIcon className="text-muted-foreground" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShareIcon className="text-muted-foreground" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2Icon className="text-muted-foreground" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: 'flex overflow-hidden w-full',
                    userButtonBox: 'flex-row-reverse',
                    userButtonOuterIdentifier: 'truncate pl-0',
                  },
                }}
              />
              <div className="flex shrink-0 items-center gap-px">
                <CartDropdown />
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <div className="h-4 w-4">
                    <NotificationsTrigger />
                  </div>
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
