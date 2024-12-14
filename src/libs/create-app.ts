import serveEmojiFavicon from '../middleware/favicon';
import { pinoLogger } from '../middleware/logger'
import { notFound, onError } from "stoker/middlewares";
import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultHook } from 'stoker/openapi';
import { logger } from 'hono/logger'

export function createRouter() {
    return new OpenAPIHono({
      strict: false,
      defaultHook,
    });
  }
  
  export default function createApp() {
    const app = createRouter();
    app.use(serveEmojiFavicon("📝"));
    app.use(logger());
  
    app.notFound(notFound);
    app.onError(onError);
    return app;
  }
