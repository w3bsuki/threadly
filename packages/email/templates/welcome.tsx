import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type WelcomeTemplateProps = {
  readonly firstName: string;
  readonly dashboardUrl?: string;
  readonly browseUrl?: string;
};

export const WelcomeTemplate = ({
  firstName,
  dashboardUrl = 'https://app.threadly.com',
  browseUrl = 'https://threadly.com',
}: WelcomeTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Welcome to Threadly - Your fashion marketplace awaits!</Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto py-12 px-4">
          {/* Header */}
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              ✨ Welcome to Threadly
            </Text>
            <Text className="text-lg text-gray-600">
              The premium marketplace for fashion lovers
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Hi {firstName}! 👋
            </Text>
            
            <Text className="text-gray-700 mb-6 leading-relaxed">
              Welcome to Threadly! We're thrilled to have you join our community of fashion enthusiasts. 
              Whether you're looking to discover unique pieces or sell items from your closet, 
              you're in the right place.
            </Text>

            {/* Features Section */}
            <Section className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Here's what you can do:
              </Text>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Text className="text-2xl mr-3">🛍️</Text>
                  <div>
                    <Text className="font-medium text-gray-900 mb-1">Browse & Buy</Text>
                    <Text className="text-gray-600 text-sm">
                      Discover curated fashion from trusted sellers
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Text className="text-2xl mr-3">💰</Text>
                  <div>
                    <Text className="font-medium text-gray-900 mb-1">Sell & Earn</Text>
                    <Text className="text-gray-600 text-sm">
                      Turn your closet into cash with our easy listing tools
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Text className="text-2xl mr-3">💬</Text>
                  <div>
                    <Text className="font-medium text-gray-900 mb-1">Connect</Text>
                    <Text className="text-gray-600 text-sm">
                      Chat directly with buyers and sellers
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Text className="text-2xl mr-3">⭐</Text>
                  <div>
                    <Text className="font-medium text-gray-900 mb-1">Build Trust</Text>
                    <Text className="text-gray-600 text-sm">
                      Rate and review to build your reputation
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            <Hr className="my-6" />

            {/* Call to Action */}
            <Section className="text-center">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Ready to get started?
              </Text>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  href={browseUrl}
                  className="bg-black text-white px-6 py-3 rounded-lg font-medium text-center"
                >
                  Browse Products
                </Button>
                
                <Button
                  href={dashboardUrl}
                  className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium text-center border border-gray-300"
                >
                  Go to Dashboard
                </Button>
              </div>
            </Section>

            {/* Tips Section */}
            <Section className="mt-8 p-4 bg-gray-50 rounded-lg">
              <Text className="font-semibold text-gray-900 mb-2">
                💡 Pro Tips for Success:
              </Text>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Complete your profile to build trust with buyers</li>
                <li>• Take clear, well-lit photos of your items</li>
                <li>• Write detailed descriptions with measurements</li>
                <li>• Respond quickly to messages for better ratings</li>
              </ul>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="text-center mt-8">
            <Text className="text-gray-500 text-sm">
              Need help? Check out our{' '}
              <Link href={`${browseUrl}/support`} className="text-black underline">
                Help Center
              </Link>{' '}
              or reply to this email.
            </Text>
            
            <Text className="text-gray-500 text-sm mt-4">
              Happy shopping & selling! 🎉<br />
              The Threadly Team
            </Text>
            
            <Hr className="my-4" />
            
            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace<br />
              If you didn't create this account, please{' '}
              <Link href={`${browseUrl}/contact`} className="text-gray-600 underline">
                contact us
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

WelcomeTemplate.PreviewProps = {
  firstName: 'Alex',
  dashboardUrl: 'https://app.threadly.com',
  browseUrl: 'https://threadly.com',
};

export default WelcomeTemplate;