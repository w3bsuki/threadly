import { NextRequest, NextResponse } from 'next/server';

export async function testApiHandler(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    body,
    headers = {},
  } = options;

  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  try {
    const response = await handler(request);
    const data = await response.json().catch(() => null);
    
    return {
      response,
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    throw error;
  }
}

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', body, headers = {}, searchParams = {} } = options;
  
  const urlWithParams = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value);
  });

  return new NextRequest(urlWithParams.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}