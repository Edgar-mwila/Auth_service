import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { authHandler } from '../handlers/authHandler';
import { createRouter } from '../libs/create-app';

// Registration Route Definition
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().min(3).max(50),
            email: z.string().email(),
            password: z.string().min(8)
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: 'User successfully registered',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.number(),
              username: z.string(),
              email: z.string()
            })
          })
        }
      }
    },
    409: {
      description: 'User already exists',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    },
    500: {
      description: 'Internal server error',
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

// Login Route Definition
const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              username: z.string().optional(),
              email: z.string().optional(),
              password: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: z.object({
              user: z.object({
                id: z.number(),
                username: z.string(),
                email: z.string(),
              }),
            }),
          },
        },
      },
      401: {
        description: 'Invalid credentials',
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

// Logout Route Definition
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  responses: {
    200: {
      description: 'User successfully logged out',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      }
    }
  }
});

// Forgot Password Route Definition
const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email()
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Password reset link sent',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      }
    }
  }
});

// Reset Password Route Definition
const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
            password: z.string().min(8)
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Password successfully reset',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      }
    },
    400: {
      description: 'Invalid or expired token',
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

// Create the auth router
export const authRoutes = createRouter()
    .openapi(registerRoute, authHandler.register)
    .openapi(loginRoute, authHandler.login)
    .openapi(logoutRoute, authHandler.logout)
    .openapi(forgotPasswordRoute, authHandler.forgotPassword)
    .openapi(resetPasswordRoute, authHandler.resetPassword);
