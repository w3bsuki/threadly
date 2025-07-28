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

type OrderShippedTemplateProps = {
  readonly firstName: string;
  readonly orderId: string;
  readonly productTitle: string;
  readonly productImage?: string;
  readonly sellerName: string;
  readonly trackingNumber: string;
  readonly trackingUrl?: string;
  readonly orderUrl?: string;
  readonly estimatedDelivery?: string;
};

export const OrderShippedTemplate = ({
  firstName,
  orderId,
  productTitle,
  productImage,
  sellerName,
  trackingNumber,
  trackingUrl,
  orderUrl = 'https://app.threadly.com/orders',
  estimatedDelivery = '3-5 business days',
}: OrderShippedTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Your order #{orderId} is on its way!</Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto px-4 py-12">
          {/* Header */}
          <Section className="mb-8 text-center">
            <Text className="mb-2 font-bold text-3xl text-gray-900">
              📦 Your Order Has Shipped!
            </Text>
            <Text className="text-gray-600 text-lg">
              Your Threadly purchase is on its way
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <Text className="mb-4 font-semibold text-gray-900 text-xl">
              Hi {firstName}!
            </Text>

            <Text className="mb-6 text-gray-700">
              Great news! Your order has shipped and is on its way to you. Use
              the tracking information below to follow your package's journey.
            </Text>

            {/* Order Summary */}
            <Section className="mb-6 rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col gap-4 md:flex-row">
                {productImage && (
                  <div className="flex-shrink-0">
                    <Img
                      alt={productTitle}
                      className="rounded-lg object-cover"
                      height={120}
                      src={productImage}
                      width={120}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <Text className="mb-2 font-semibold text-gray-900">
                    {productTitle}
                  </Text>
                  <Text className="mb-4 text-gray-600">
                    Sold by: {sellerName}
                  </Text>

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <Text className="font-medium text-gray-900">
                        Order ID:
                      </Text>
                      <Text className="text-gray-600">#{orderId}</Text>
                    </div>
                    <div>
                      <Text className="font-medium text-gray-900">Status:</Text>
                      <Text className="font-medium text-blue-600">Shipped</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Tracking Information */}
            <Section className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <Text className="mb-4 font-semibold text-blue-900 text-lg">
                📍 Tracking Information
              </Text>

              <div className="space-y-3">
                <div>
                  <Text className="font-medium text-blue-900">
                    Tracking Number:
                  </Text>
                  <Text className="font-mono text-blue-800 text-lg">
                    {trackingNumber}
                  </Text>
                </div>

                <div>
                  <Text className="font-medium text-blue-900">
                    Estimated Delivery:
                  </Text>
                  <Text className="text-blue-800">{estimatedDelivery}</Text>
                </div>
              </div>

              {trackingUrl && (
                <Section className="mt-4">
                  <Button
                    className="rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white"
                    href={trackingUrl}
                  >
                    Track Your Package
                  </Button>
                </Section>
              )}
            </Section>

            {/* Shipping Progress */}
            <Section className="mb-6">
              <Text className="mb-4 font-semibold text-gray-900 text-lg">
                Shipping Progress
              </Text>

              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-sm">
                    ✓
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">
                      Order Confirmed
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Your payment was processed successfully
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-sm">
                    ✓
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">
                      Prepared for Shipping
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      The seller packaged your item with care
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
                    📦
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">
                      In Transit
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Your package is on its way to you
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 text-sm">
                    🏠
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Delivered</Text>
                    <Text className="text-gray-600 text-sm">
                      We'll notify you when it arrives
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* Action Buttons */}
            <Section className="text-center">
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  className="rounded-lg bg-black px-6 py-3 text-center font-medium text-white"
                  href={orderUrl}
                >
                  View Order Details
                </Button>

                {trackingUrl && (
                  <Button
                    className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-center font-medium text-gray-900"
                    href={trackingUrl}
                  >
                    Track Package
                  </Button>
                )}
              </div>
            </Section>

            {/* Tips Section */}
            <Section className="mt-8 rounded-lg bg-yellow-50 p-4">
              <Text className="mb-2 font-semibold text-yellow-900">
                📋 Delivery Tips:
              </Text>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Make sure someone is available to receive the package</li>
                <li>• Check the tracking link for real-time updates</li>
                <li>• Contact the seller if you have delivery concerns</li>
                <li>• Inspect your item upon delivery</li>
              </ul>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="mt-8 text-center">
            <Text className="text-gray-500 text-sm">
              Questions about your delivery? Visit your{' '}
              <Link className="text-black underline" href={orderUrl}>
                order page
              </Link>{' '}
              or message the seller directly.
            </Text>

            <Text className="mt-4 text-gray-500 text-sm">
              We can't wait for you to receive your order! 📦<br />
              The Threadly Team
            </Text>

            <Hr className="my-4" />

            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace
              <br />
              Order #{orderId} • Tracking: {trackingNumber}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

OrderShippedTemplate.PreviewProps = {
  firstName: 'Sarah',
  orderId: 'ORD-2025-001',
  productTitle: 'Vintage Chanel Quilted Bag - Black Leather',
  productImage:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
  sellerName: 'Emma Fashion',
  trackingNumber: '1Z999AA1234567890',
  trackingUrl: 'https://www.ups.com/track?loc=en_US&tracknum=1Z999AA1234567890',
  orderUrl: 'https://app.threadly.com/orders/ORD-2025-001',
  estimatedDelivery: 'Tuesday, January 14',
};

export default OrderShippedTemplate;
