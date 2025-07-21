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
      <Preview>Order #{orderId} confirmed - Thank you for your purchase!</Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto py-12 px-4">
          {/* Header */}
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Order Confirmed!
            </Text>
            <Text className="text-lg text-gray-600">
              Thank you for your purchase on Threadly
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Hi {firstName}!
            </Text>
            
            <Text className="text-gray-700 mb-6">
              Great news! Your order has been confirmed and the seller has been notified. 
              You'll receive another email when your item ships.
            </Text>

            {/* Order Details */}
            <Section className="border border-gray-200 rounded-lg p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </Text>
              
              <div className="flex flex-col md:flex-row gap-4">
                {productImage && (
                  <div className="flex-shrink-0">
                    <Img
                      src={productImage}
                      alt={productTitle}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-2">
                    {productTitle}
                  </Text>
                  <Text className="text-gray-600 mb-2">
                    Sold by: {sellerName}
                  </Text>
                  <Text className="text-xl font-bold text-green-600">
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
                  <Text className="text-yellow-600 font-medium">Processing</Text>
                </div>
              </div>
            </Section>

            {/* Next Steps */}
            <Section className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                What happens next?
              </Text>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Order Confirmed</Text>
                    <Text className="text-gray-600 text-sm">
                      Your payment has been processed and the seller notified
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Preparing to Ship</Text>
                    <Text className="text-gray-600 text-sm">
                      The seller will prepare your item and arrange shipping
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
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
                  <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
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
                href={orderUrl}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium text-center"
              >
                Track Your Order
              </Button>
            </Section>

            {/* Support Section */}
            <Section className="mt-8 p-4 bg-blue-50 rounded-lg">
              <Text className="font-semibold text-blue-900 mb-2">
                💬 Need Help?
              </Text>
              <Text className="text-blue-800 text-sm">
                You can message the seller directly through your order page, or contact our 
                support team if you have any questions about your purchase.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="text-center mt-8">
            <Text className="text-gray-500 text-sm">
              Questions about your order? Visit your{' '}
              <Link href={orderUrl} className="text-black underline">
                order page
              </Link>{' '}
              or reply to this email.
            </Text>
            
            <Text className="text-gray-500 text-sm mt-4">
              Thank you for choosing Threadly! 🛍️<br />
              The Threadly Team
            </Text>
            
            <Hr className="my-4" />
            
            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace<br />
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
  productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
  price: 89900, // $899.00 in cents
  sellerName: 'Emma Fashion',
  orderUrl: 'https://app.threadly.com/orders/ORD-2025-001',
};

export default OrderConfirmationTemplate;