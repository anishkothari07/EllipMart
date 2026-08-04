import { createSwaggerSpec } from 'next-swagger-doc';
import { swaggerPaths } from './swagger-paths';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'apps/storefront/app/api', 
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SmartGO API Documentation',
        version: '1.0.0',
        description: 'Complete API documentation for the SmartGO e-commerce backend.',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        { BearerAuth: [] }
      ],
      paths: swaggerPaths as any,
    },
  });
  return spec;
};
