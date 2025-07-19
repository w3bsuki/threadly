import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Separator } from '@repo/design-system/components';
import { 
  LifeBuoy, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  FileText,
  Shield,
  CreditCard,
  Package,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getDictionary } from '@repo/internationalization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Support Center',
    description: 'Get help with your Threadly experience',
  };
}

const SupportPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
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
      topics: ['Order Status', 'Shipping Delays', 'Returns & Refunds', 'Lost Packages'],
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: CreditCard,
      title: 'Payments & Billing',
      description: 'Payment issues, refunds, seller payouts',
      topics: ['Payment Failed', 'Refund Status', 'Seller Payouts', 'Billing Questions'],
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      description: 'Report issues, account security, disputes',
      topics: ['Report User', 'Account Security', 'Fake Items', 'Dispute Resolution'],
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      icon: HelpCircle,
      title: 'General Help',
      description: 'Account settings, app features, how-to guides',
      topics: ['Account Settings', 'How to Sell', 'App Features', 'Technical Issues'],
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      primary: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@threadly.com',
      availability: 'Response within 24 hours',
      action: 'Send Email',
      href: 'mailto:support@threadly.com'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '1-800-THREADLY',
      availability: 'Mon-Fri 9AM-6PM EST',
      action: 'Call Now',
      href: 'tel:1-800-847-3235'
    }
  ];

  const quickLinks = [
    { title: 'Seller Guide', href: '/help/selling', icon: Package },
    { title: 'Buyer Guide', href: '/help/buying', icon: HelpCircle },
    { title: 'Community Guidelines', href: '/help/guidelines', icon: Shield },
    { title: 'Terms of Service', href: '/help/terms', icon: FileText },
    { title: 'Privacy Policy', href: '/help/privacy', icon: Shield },
    { title: 'Fee Structure', href: '/help/fees', icon: CreditCard }
  ];

  return (
    <>
      <Header pages={['Dashboard', 'Support']} page="Support" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="text-center">
          <LifeBuoy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
          <p className="text-muted-foreground text-lg">
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
                  key={method.title}
                  className={`p-4 rounded-[var(--radius-lg)] border ${method.primary ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <method.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{method.title}</h3>
                  </div>
                  <p className="text-sm mb-1">{method.description}</p>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {method.availability}
                  </p>
                  <Button 
                    size="sm" 
                    variant={method.primary ? 'default' : 'outline'}
                    className="w-full"
                    asChild={!!method.href}
                  >
                    {method.href ? (
                      <Link href={method.href}>
                        {method.action}
                      </Link>
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
          <h2 className="text-xl font-semibold">Browse Help Topics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {supportCategories.map((category) => (
              <Card key={category.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[var(--radius-lg)] border ${category.color}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.topics.map((topic) => (
                      <Button
                        key={topic}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-auto p-2"
                        asChild
                      >
                        <Link href={`/help/topic/${topic.toLowerCase().replace(/\s+/g, '-')}`}>
                          <span className="text-left">{topic}</span>
                          <ExternalLink className="h-3 w-3 ml-auto" />
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
          <h2 className="text-xl font-semibold">Helpful Resources</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Button
                key={link.title}
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4 mr-3" />
                  <span>{link.title}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Status & Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                All Systems Operational
              </Badge>
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-[var(--radius-full)]"></div>
                <span>Website</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-[var(--radius-full)]"></div>
                <span>Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-[var(--radius-full)]"></div>
                <span>Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-[var(--radius-full)]"></div>
                <span>Search</span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Last updated: Just now
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/status">
                  View Status Page
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900">Need immediate help?</h3>
                <p className="text-sm text-orange-800 mb-2">
                  For urgent account issues or safety concerns, please contact us immediately.
                </p>
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
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