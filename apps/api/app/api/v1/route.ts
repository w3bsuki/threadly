import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v1',
    status: 'active',
    message: 'Threadly API v1',
    documentation: '/api/v1/docs',
    endpoints: {
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      search: '/api/v1/search'
    },
    timestamp: new Date().toISOString()
  });
}