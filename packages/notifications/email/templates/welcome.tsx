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
        <Container className="mx-auto px-4 py-12">
          {/* Header */}
          <Section className="mb-8 text-center">
            <Text className="mb-2 font-bold text-3xl text-gray-900">
              ✨ Welcome to Threadly
            </Text>
            <Text className="text-gray-600 text-lg">
              The premium marketplace for fashion lovers
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <Text className="mb-4 font-semibold text-gray-900 text-xl">
              Hi {firstName}! 👋
            </Text>

            <Text className="mb-6 text-gray-700 leading-relaxed">
              Welcome to Threadly! We're thrilled to have you join our community
              of fashion enthusiasts. Whether you're looking to discover unique
              pieces or sell items from your closet, you're in the right place.
            </Text>

            {/* Features Section */}
            <Section className="mb-8">
              <Text className="mb-4 font-semibold text-gray-900 text-lg">
                Here's what you can do:
              </Text>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Text className="mr-3 text-2xl">🛍️</Text>
                  <div>
                    <Text className="mb-1 font-medium text-gray-900">
                      Browse & Buy
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Discover curated fashion from trusted sellers
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <Text className="mr-3 text-2xl">💰</Text>
                  <div>
                    <Text className="mb-1 font-medium text-gray-900">
                      Sell & Earn
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Turn your closet into cash with our easy listing tools
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <Text className="mr-3 text-2xl">💬</Text>
                  <div>
                    <Text className="mb-1 font-medium text-gray-900">
                      Connect
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Chat directly with buyers and sellers
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <Text className="mr-3 text-2xl">⭐</Text>
                  <div>
                    <Text className="mb-1 font-medium text-gray-900">
                      Build Trust
                    </Text>
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
              <Text className="mb-4 font-semibold text-gray-900 text-lg">
                Ready to get started?
              </Text>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  className="rounded-lg bg-black px-6 py-3 text-center font-medium text-white"
                  href={browseUrl}
                >
                  Browse Products
                </Button>

                <Button
                  className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-center font-medium text-gray-900"
                  href={dashboardUrl}
                >
                  Go to Dashboard
                </Button>
              </div>
            </Section>

            {/* Tips Section */}
            <Section className="mt-8 rounded-lg bg-gray-50 p-4">
              <Text className="mb-2 font-semibold text-gray-900">
                💡 Pro Tips for Success:
              </Text>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Complete your profile to build trust with buyers</li>
                <li>• Take clear, well-lit photos of your items</li>
                <li>• Write detailed descriptions with measurements</li>
                <li>• Respond quickly to messages for better ratings</li>
              </ul>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="mt-8 text-center">
            <Text className="text-gray-500 text-sm">
              Need help? Check out our{' '}
              <Link
                className="text-black underline"
                href={`${browseUrl}/support`}
              >
                Help Center
              </Link>{' '}
              or reply to this email.
            </Text>

            <Text className="mt-4 text-gray-500 text-sm">
              Happy shopping & selling! 🎉<br />
              The Threadly Team
            </Text>

            <Hr className="my-4" />

            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace
              <br />
              If you didn't create this account, please{' '}
              <Link
                className="text-gray-600 underline"
                href={`${browseUrl}/contact`}
              >
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
