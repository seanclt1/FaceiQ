/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FACEPP_API_KEY: string;
  readonly VITE_FACEPP_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
