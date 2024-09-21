/// <reference types="vite/client" />
  interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_REALTIME_ENDPOINT: string
  readonly VITE_REALTIME_AUTHORIZER: string
  readonly VITE_REALTIME_NAMESPACE: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }