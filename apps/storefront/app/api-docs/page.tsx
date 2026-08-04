'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <SwaggerUI url="/api/swagger.json" />
    </div>
  );
}
