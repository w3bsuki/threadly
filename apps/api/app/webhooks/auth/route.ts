import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { database } from '@repo/database';
import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from '@repo/auth/server';
import { logError } from '@repo/observability/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

const handleUserCreated = async (data: UserJSON) => {
  try {
    // Create or update user in database
    const email = data.email_addresses.at(0)?.email_address;
    if (!email) {
      throw new Error('No email address found for user');
    }

    // Check if this is the first user (make them admin)
    const userCount = await database.user.count();
    const isFirstUser = userCount === 0;

    await database.user.upsert({
      where: { clerkId: data.id },
      update: {
        email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url,
      },
      create: {
        clerkId: data.id,
        email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url,
        role: isFirstUser ? 'ADMIN' : 'USER',
      },
    });

    // Track in analytics
    analytics.identify({
      distinctId: data.id,
      properties: {
        email,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        avatar: data.image_url,
        phoneNumber: data.phone_numbers.at(0)?.phone_number,
      },
    });

    analytics.capture({
      event: 'User Created',
      distinctId: data.id,
    });

    return new Response('User created', { status: 201 });
  } catch (error) {
    logError('Error creating user in database', error);
    return new Response('Error creating user', { status: 500 });
  }
};

const handleUserUpdated = async (data: UserJSON) => {
  try {
    // Update user in database
    const email = data.email_addresses.at(0)?.email_address;
    if (!email) {
      throw new Error('No email address found for user');
    }

    await database.user.update({
      where: { clerkId: data.id },
      data: {
        email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url,
      },
    });

    // Track in analytics
    analytics.identify({
      distinctId: data.id,
      properties: {
        email,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: new Date(data.created_at),
        avatar: data.image_url,
        phoneNumber: data.phone_numbers.at(0)?.phone_number,
      },
    });

    analytics.capture({
      event: 'User Updated',
      distinctId: data.id,
    });

    return new Response('User updated', { status: 201 });
  } catch (error) {
    logError('Error updating user in database', error);
    return new Response('Error updating user', { status: 500 });
  }
};

const handleUserDeleted = async (data: DeletedObjectJSON) => {
  if (!data.id) {
    return new Response('No user ID provided', { status: 400 });
  }

  try {
    // Check if user exists before trying to delete
    const user = await database.user.findUnique({
      where: { clerkId: data.id },
    });

    if (user) {
      // Delete user and all related data (cascade delete)
      await database.user.delete({
        where: { clerkId: data.id },
      });
    }

    // Track in analytics
    analytics.identify({
      distinctId: data.id,
      properties: {
        deleted: new Date(),
      },
    });

    analytics.capture({
      event: 'User Deleted',
      distinctId: data.id,
    });

    return new Response('User deleted', { status: 201 });
  } catch (error) {
    logError('Error deleting user in database', error);
    return new Response('Error deleting user', { status: 500 });
  }
};

const handleOrganizationCreated = (data: OrganizationJSON) => {
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId: data.created_by,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  if (data.created_by) {
    analytics.capture({
      event: 'Organization Created',
      distinctId: data.created_by,
    });
  }

  return new Response('Organization created', { status: 201 });
};

const handleOrganizationUpdated = (data: OrganizationJSON) => {
  analytics.groupIdentify({
    groupKey: data.id,
    groupType: 'company',
    distinctId: data.created_by,
    properties: {
      name: data.name,
      avatar: data.image_url,
    },
  });

  if (data.created_by) {
    analytics.capture({
      event: 'Organization Updated',
      distinctId: data.created_by,
    });
  }

  return new Response('Organization updated', { status: 201 });
};

const handleOrganizationMembershipCreated = (
  data: OrganizationMembershipJSON
) => {
  analytics.groupIdentify({
    groupKey: data.organization.id,
    groupType: 'company',
    distinctId: data.public_user_data.user_id,
  });

  analytics.capture({
    event: 'Organization Member Created',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership created', { status: 201 });
};

const handleOrganizationMembershipDeleted = (
  data: OrganizationMembershipJSON
) => {
  // Need to unlink the user from the group

  analytics.capture({
    event: 'Organization Member Deleted',
    distinctId: data.public_user_data.user_id,
  });

  return new Response('Organization membership deleted', { status: 201 });
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = (await request.json()) as object;
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent | undefined;

  // Verify the payload with the headers
  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = event.data;
  const eventType = event.type;


  let response: Response = new Response('', { status: 201 });

  switch (eventType) {
    case 'user.created': {
      response = await handleUserCreated(event.data);
      break;
    }
    case 'user.updated': {
      response = await handleUserUpdated(event.data);
      break;
    }
    case 'user.deleted': {
      response = await handleUserDeleted(event.data);
      break;
    }
    case 'organization.created': {
      response = handleOrganizationCreated(event.data);
      break;
    }
    case 'organization.updated': {
      response = handleOrganizationUpdated(event.data);
      break;
    }
    case 'organizationMembership.created': {
      response = handleOrganizationMembershipCreated(event.data);
      break;
    }
    case 'organizationMembership.deleted': {
      response = handleOrganizationMembershipDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  return response;
};
