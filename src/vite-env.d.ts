/// <reference types="vite/client" />
/// <reference types="react" />

// React DOM Client types
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
  export function hydrateRoot(container: Element | Document, initialChildren: React.ReactNode): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
}

// Vite plugin types
declare module '@vitejs/plugin-react' {
  export default function react(options?: Record<string, unknown>): Record<string, unknown>;
}

declare module 'vite' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
  export * from 'vite';
}

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  readonly VITE_API_URL: string;
  readonly VITE_GITHUB_TOKEN: string;
  readonly VITE_GOOGLE_VISION_API_KEY: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
