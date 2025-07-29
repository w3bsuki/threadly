import {
  AccountDropdown,
  MobileAccountDropdown,
} from '@repo/ui/components/navigation/account-dropdown';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta = {
  title: 'Modern/Navigation/AccountDropdown',
  component: AccountDropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modern account dropdown component for user navigation with smooth animations and mobile optimization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isSignedIn: {
      control: 'boolean',
      description: 'Whether the user is signed in',
    },
    user: {
      control: 'object',
      description: 'User information to display when signed in',
    },
    locale: {
      control: 'text',
      description: 'Locale for routing',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    dictionary: {
      control: 'object',
      description: 'Translations for menu items',
    },
  },
} satisfies Meta<typeof AccountDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  args: {
    isSignedIn: false,
    locale: 'en',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const SignedIn: Story = {
  args: {
    isSignedIn: true,
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    locale: 'en',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const SignedInNoEmail: Story = {
  args: {
    isSignedIn: true,
    user: {
      name: 'Jane Smith',
    },
    locale: 'en',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const Mobile: Story = {
  render: (args) => <MobileAccountDropdown {...args} />,
  args: {
    isSignedIn: true,
    user: {
      name: 'Mobile User',
      email: 'mobile@example.com',
    },
    locale: 'en',
    onSignOut: () => alert('Sign out clicked'),
  },
};

export const CustomDictionary: Story = {
  args: {
    isSignedIn: true,
    user: {
      name: 'Usuario',
      email: 'usuario@ejemplo.com',
    },
    locale: 'es',
    dictionary: {
      profile: 'Perfil',
      orders: 'Pedidos',
      settings: 'Configuración',
      signOut: 'Cerrar Sesión',
      signIn: 'Iniciar Sesión',
      createAccount: 'Crear Cuenta',
    },
    onSignOut: () => alert('Cerrar sesión clicked'),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isSignedIn, setIsSignedIn] = useState(false);

    return (
      <div className="flex items-center gap-4">
        <AccountDropdown
          isSignedIn={isSignedIn}
          locale="en"
          onSignOut={() => setIsSignedIn(false)}
          user={
            isSignedIn
              ? {
                  name: 'Interactive User',
                  email: 'user@example.com',
                }
              : undefined
          }
        />
        <button
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700"
          onClick={() => setIsSignedIn(!isSignedIn)}
        >
          {isSignedIn ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    );
  },
};

export const DarkMode: Story = {
  args: {
    isSignedIn: true,
    user: {
      name: 'Dark Mode User',
      email: 'dark@example.com',
    },
    locale: 'en',
    onSignOut: () => alert('Sign out clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
