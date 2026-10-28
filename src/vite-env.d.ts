/// <reference types="vite/client" />

declare module 'process/browser';

declare module 'swagger-ui-react' {
  import type React from 'react';

  export interface SwaggerUIProps {
    spec?: Record<string, unknown> | string;
    url?: string;
    supportedSubmitMethods?: string[];
    validatorUrl?: string | null;
    showExtensions?: boolean;
    [key: string]: unknown;
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare const __APP_VERSION__: string;
