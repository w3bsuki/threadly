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
        <Container className="mx-auto py-12 px-4">
          {/* Header */}
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              📦 Your Order Has Shipped!
            </Text>
            <Text className="text-lg text-gray-600">
              Your Threadly purchase is on its way
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Hi {firstName}!
            </Text>
            
            <Text className="text-gray-700 mb-6">
              Great news! Your order has shipped and is on its way to you. 
              Use the tracking information below to follow your package's journey.
            </Text>

            {/* Order Summary */}
            <Section className="border border-gray-200 rounded-lg p-6 mb-6">
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
                  <Text className="text-gray-600 mb-4">
                    Sold by: {sellerName}
                  </Text>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <Text className="font-medium text-gray-900">Order ID:</Text>
                      <Text className="text-gray-600">#{orderId}</Text>
                    </div>
                    <div>
                      <Text className="font-medium text-gray-900">Status:</Text>
                      <Text className="text-blue-600 font-medium">Shipped</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Tracking Information */}
            <Section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <Text className="text-lg font-semibold text-blue-900 mb-4">
                📍 Tracking Information
              </Text>
              
              <div className="space-y-3">
                <div>
                  <Text className="font-medium text-blue-900">Tracking Number:</Text>
                  <Text className="font-mono text-blue-800 text-lg">
                    {trackingNumber}
                  </Text>
                </div>
                
                <div>
                  <Text className="font-medium text-blue-900">Estimated Delivery:</Text>
                  <Text className="text-blue-800">
                    {estimatedDelivery}
                  </Text>
                </div>
              </div>
              
              {trackingUrl && (
                <Section className="mt-4">
                  <Button
                    href={trackingUrl}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-center"
                  >
                    Track Your Package
                  </Button>
                </Section>
              )}
            </Section>

            {/* Shipping Progress */}
            <Section className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Progress
              </Text>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Order Confirmed</Text>
                    <Text className="text-gray-600 text-sm">
                      Your payment was processed successfully
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">Prepared for Shipping</Text>
                    <Text className="text-gray-600 text-sm">
                      The seller packaged your item with care
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    📦
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">In Transit</Text>
                    <Text className="text-gray-600 text-sm">
                      Your package is on its way to you
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  href={orderUrl}
                  className="bg-black text-white px-6 py-3 rounded-lg font-medium text-center"
                >
                  View Order Details
                </Button>
                
                {trackingUrl && (
                  <Button
                    href={trackingUrl}
                    className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium text-center border border-gray-300"
                  >
                    Track Package
                  </Button>
                )}
              </div>
            </Section>

            {/* Tips Section */}
            <Section className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <Text className="font-semibold text-yellow-900 mb-2">
                📋 Delivery Tips:
              </Text>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Make sure someone is available to receive the package</li>
                <li>• Check the tracking link for real-time updates</li>
                <li>• Contact the seller if you have delivery concerns</li>
                <li>• Inspect your item upon delivery</li>
              </ul>
            </Section>
          </Section>

          {/* Footer */}
          <Section className="text-center mt-8">
            <Text className="text-gray-500 text-sm">
              Questions about your delivery? Visit your{' '}
              <Link href={orderUrl} className="text-black underline">
                order page
              </Link>{' '}
              or message the seller directly.
            </Text>
            
            <Text className="text-gray-500 text-sm mt-4">
              We can't wait for you to receive your order! 📦<br />
              The Threadly Team
            </Text>
            
            <Hr className="my-4" />
            
            <Text className="text-gray-400 text-xs">
              Threadly - Premium Fashion Marketplace<br />
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
  productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
  sellerName: 'Emma Fashion',
  trackingNumber: '1Z999AA1234567890',
  trackingUrl: 'https://www.ups.com/track?loc=en_US&tracknum=1Z999AA1234567890',
  orderUrl: 'https://app.threadly.com/orders/ORD-2025-001',
  estimatedDelivery: 'Tuesday, January 14',
};

export default OrderShippedTemplate;