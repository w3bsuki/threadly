import { currentUser } from '@repo/auth/server';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@repo/ui/components';
import { getDictionary } from '@repo/internationalization';
import {
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Shield,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '../components/header';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return {
    title: 'Support Center',
    description: 'Get help with your Threadly experience',
  };
}

const SupportPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const supportCategories = [
    {
      icon: Package,
      title: 'Orders & Shipping',
      description: 'Track orders, shipping issues, returns',
      topics: [
        'Order Status',
        'Shipping Delays',
        'Returns & Refunds',
        'Lost Packages',
      ],
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      icon: CreditCard,
      title: 'Payments & Billing',
      description: 'Payment issues, refunds, seller payouts',
      topics: [
        'Payment Failed',
        'Refund Status',
        'Seller Payouts',
        'Billing Questions',
      ],
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      description: 'Report issues, account security, disputes',
      topics: [
        'Report User',
        'Account Security',
        'Fake Items',
        'Dispute Resolution',
      ],
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      icon: HelpCircle,
      title: 'General Help',
      description: 'Account settings, app features, how-to guides',
      topics: [
        'Account Settings',
        'How to Sell',
        'App Features',
        'Technical Issues',
      ],
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      primary: true,
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@threadly.com',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      href: 'mailto:support@threadly.com',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '1-800-THREADLY',
      availability: 'Mon-Fri 9AM-6PM EST',
      action: 'Call Now',
      href: 'tel:1-800-847-3235',
    },
  ];

  const quickLinks = [
    { title: 'Seller Guide', href: '/help/selling', icon: Package },
    { title: 'Buyer Guide', href: '/help/buying', icon: HelpCircle },
    { title: 'Community Guidelines', href: '/help/guidelines', icon: Shield },
    { title: 'Terms of Service', href: '/help/terms', icon: FileText },
    { title: 'Privacy Policy', href: '/help/privacy', icon: Shield },
    { title: 'Fee Structure', href: '/help/fees', icon: CreditCard },
  ];

  return (
    <>
      <Header
        dictionary={dictionary}
        page="Support"
        pages={['Dashboard', 'Support']}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="text-center">
          <LifeBuoy className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 font-bold text-3xl">How can we help you?</h1>
          <p className="text-lg text-muted-foreground">
            We're here to support your Threadly experience
          </p>
        </div>

        {/* Quick Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {contactMethods.map((method) => (
                <div
                  className={`rounded-[var(--radius-lg)] border p-4 ${method.primary ? 'border-primary bg-primary/5' : 'border-border'}`}
                  key={method.title}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <method.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{method.title}</h3>
                  </div>
                  <p className="mb-1 text-sm">{method.description}</p>
                  <p className="mb-3 flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" />
                    {method.availability}
                  </p>
                  <Button
                    asChild={!!method.href}
                    className="w-full"
                    size="sm"
                    variant={method.primary ? 'default' : 'outline'}
                  >
                    {method.href ? (
                      <Link href={method.href}>{method.action}</Link>
                    ) : (
                      method.action
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Categories */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Browse Help Topics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {supportCategories.map((category) => (
              <Card
                className="transition-shadow hover:shadow-md"
                key={category.title}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-[var(--radius-lg)] border p-2 ${category.color}`}
                    >
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {category.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.topics.map((topic) => (
                      <Button
                        asChild
                        className="h-auto w-full justify-start p-2"
                        key={topic}
                        size="sm"
                        variant="ghost"
                      >
                        <Link
                          href={`/help/topic/${topic.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <span className="text-left">{topic}</span>
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Helpful Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Button
                asChild
                className="h-auto justify-start p-4"
                key={link.title}
                variant="outline"
              >
                <Link href={link.href}>
                  <link.icon className="mr-3 h-4 w-4" />
                  <span>{link.title}</span>
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Status & Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-500" variant="default">
                All Systems Operational
              </Badge>
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-[var(--radius-full)] bg-green-500" />
                <span>Website</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-[var(--radius-full)] bg-green-500" />
                <span>Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-[var(--radius-full)] bg-green-500" />
                <span>Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-[var(--radius-full)] bg-green-500" />
                <span>Search</span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Last updated: Just now
              </p>
              <Button asChild size="sm" variant="ghost">
                <Link href="/status">
                  View Status Page
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">
                  Need immediate help?
                </h3>
                <p className="mb-2 text-orange-800 text-sm">
                  For urgent account issues or safety concerns, please contact
                  us immediately.
                </p>
                <Button
                  className="border-orange-300 text-orange-700"
                  size="sm"
                  variant="outline"
                >
                  Emergency Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupportPage;
