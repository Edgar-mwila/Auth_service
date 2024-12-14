import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { oauthHandler } from '../handlers/oauthHandler';
import { createRouter } from '../libs/create-app';

// Initiate OAuth Route Definition
const initiateOAuthRoute = createRoute({
  method: 'get',
  path: '/oauth/:provider/initiate',
  request: {
    params: z.object({
      provider: z.enum(['google', 'facebook', 'github']),
    }),
  },
  responses: {
    302: {
      description: 'Redirect to OAuth provider authorization URL',
    },
    400: {
      description: 'Invalid OAuth provider',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

// Handle OAuth Callback Route Definition
const handleOAuthCallbackRoute = createRoute({
  method: 'get',
  path: '/oauth/:provider/callback',
  request: {
    params: z.object({
      provider: z.enum(['google', 'facebook', 'github']),
    }),
    query: z.object({
      code: z.string(),
      state: z.string(),
    }),
  },
  responses: {
    302: {
      description: 'Redirect to frontend dashboard on success',
    },
    400: {
      description: 'Invalid state or OAuth provider',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'OAuth authentication failed',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

// Create the OAuth Router
export const oauthRoutes = createRouter()
  .openapi(initiateOAuthRoute, oauthHandler.initiateOAuth)
  .openapi(handleOAuthCallbackRoute, oauthHandler.handleOAuthCallback);
