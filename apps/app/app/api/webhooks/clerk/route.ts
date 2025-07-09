import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { env } from '@repo/env';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);
    
    if (!primaryEmail) {
      return new Response('No primary email found', { status: 400 });
    }

    try {
      await database.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
        create: {
          clerkId: id,
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });

      // Create default preferences for new users
      if (eventType === 'user.created') {
        const user = await database.user.findUnique({
          where: { clerkId: id },
        });

        if (user) {
          await database.userPreferences.create({
            data: {
              userId: user.id,
              preferredRole: 'BUYER',
              interests: [],
              favoriteBrands: [],
              onboardingCompleted: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error handling user webhook:', error);
      return new Response('Error creating/updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      await database.user.delete({
        where: { clerkId: id },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
}