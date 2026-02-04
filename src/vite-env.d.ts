/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SW_DEV: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Background Sync API types
interface SyncManager {
    register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
}

// CSS module declarations
declare module '*.css' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}
