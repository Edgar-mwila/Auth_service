import { createRoute, z } from '@hono/zod-openapi';
import { userHandler } from '../handlers/userHandler';
import { createRouter } from '../libs/create-app';

// Get Profile Route Definition
const getUserProfileRoute = createRoute({
  method: 'get',
  path: '/profile',
  responses: {
    200: {
      description: 'User profile retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.number(),
              username: z.string(),
              email: z.string().email()
            })
          })
        }
      }
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
  }
});

// Update Profile Route Definition
const updateUserProfileRoute = createRoute({
  method: 'put',
  path: '/profile',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().min(3).max(50).optional(),
            email: z.string().email().optional()
          }).refine(
            (data) => data.username !== undefined || data.email !== undefined,
            { message: "At least one field (username or email) must be provided" }
          )
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User profile updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.number(),
              username: z.string(),
              email: z.string().email()
            })
          })
        }
      }
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
  }
});

// Create the user routes function
export const userRoutes = createRouter()
    .openapi(getUserProfileRoute, userHandler.getProfile)
    .openapi(updateUserProfileRoute, userHandler.updateProfile);
