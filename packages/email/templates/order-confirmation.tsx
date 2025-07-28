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

type OrderConfirmationTemplateProps = {
  readonly firstName: string;
  readonly orderId: string;
  readonly productTitle: string;
  readonly productImage?: string;
  readonly price: number;
  readonly sellerName: string;
  readonly orderUrl?: string;
  readonly trackingUrl?: string;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

export const OrderConfirmationTemplate = ({
  firstName,
  orderId,
  productTitle,
  productImage,
  price,
  sellerName,
  orderUrl = 'https://app.threadly.com/orders',
  trackingUrl,
}: OrderConfirmationTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>
        Order #{orderId} confirmed - Thank you for your purchase!
      </Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto px-4 py-12">
          {/* Header */}
          <Section className="mb-8 text-center">
            <Text className="mb-2 font-bold text-3xl text-gray-900">
              🎉 Order Confirmed!
            </Text>
            <Text className="text-gray-600 text-lg">
              Thank you for your purchase on Threadly
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <Text className="mb-4 font-semibold text-gray-900 text-xl">
              Hi {firstName}!
            </Text>

            <Text className="mb-6 text-gray-700">
              Great news! Your order has been confirmed and the seller has been
              notified. You'll receive another email when your item ships.
            </Text>

            {/* Order Details */}
            <Section className="mb-6 rounded-lg border border-gray-200 p-6">
              <Text className="mb-4 font-semibold text-gray-900 text-lg">
                Order Details
              </Text>

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
                  <Text className="mb-2 text-gray-600">
                    Sold by: {sellerName}
                  </Text>
                  <Text className="font-bold text-green-600 text-xl">
                    {formatCurrency(price)}
                  </Text>
                </div>
              </div>

              <Hr className="my-4" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Text className="font-medium text-gray-900">Order ID:</Text>
                  <Text className="text-gray-600">#{orderId}</Text>
                </div>
                <div>
                  <Text className="font-medium text-gray-900">Status:</Text>
                  <Text className="font-medium text-yellow-600">
                    Processing
                  </Text>
                </div>
              </div>
            </Section>

            {/* Next Steps */}
            <Section className="mb-6">
              <Text className="mb-4 font-semibold text-gray-900 text-lg">
                What happens next?
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
                      Your payment has been processed and the seller notified
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 font-bold text-sm text-yellow-600">
                    2
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">
                      Preparing to Ship
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      The seller will prepare your item and arrange shipping
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 text-sm">
                    3
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Shipped</Text>
                    <Text className="text-gray-600 text-sm">
                      You'll receive tracking information via email
                    </Text>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 text-sm">
                    4
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Delivered</Text>
                    <Text className="text-gray-600 text-sm">
                      Rate your experience and help our community grow
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* Call to Action */}
            <Section className="text-center">
              <Button
                className="rounded-lg bg-black px-6 py-3 text-center font-medium text-white"
                href={orderUrl}
              >
                Track Your Order
              </Button>
            </Section>

            {/* Support Section */}
            <Section className="mt-8 rounded-lg bg-blue-50 p-4">
              <Text className="mb-2 font-semibold text-blue-900">
                💬 Need Help?
              </Text>
              <Text className="text-blue-800 text-sm">
                You can message the seller directly through your order page, or
                contact our support team if you have any questions about your
                purchase.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="mt-8 text-center">
            <Text className="text-gray-500 text-sm">
              Questions about your order? Visit your{' '}
              <Link className="text-black underline" href={orderUrl}>
                order page
              </Link>{' '}
              or reply to this email.
            </Text>

            <Text className="mt-4 text-gray-500 text-sm">
              Thank you for choosing Threadly! 🛍️
              <br />
              The Threadly Team
            </Text>

            <Hr className="my-4" />

            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace
              <br />
              Order ID: #{orderId}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

OrderConfirmationTemplate.PreviewProps = {
  firstName: 'Sarah',
  orderId: 'ORD-2025-001',
  productTitle: 'Vintage Chanel Quilted Bag - Black Leather',
  productImage:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
  price: 89_900, // $899.00 in cents
  sellerName: 'Emma Fashion',
  orderUrl: 'https://app.threadly.com/orders/ORD-2025-001',
};

export default OrderConfirmationTemplate;
