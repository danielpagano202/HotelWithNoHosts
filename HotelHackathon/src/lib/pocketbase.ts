import PocketBase from 'pocketbase';

const pocketBaseUrl = (import.meta.env.PUBLIC_POCKETBASE_URL as string | undefined) || 'http://127.0.0.1:8090';

export const pb = new PocketBase(pocketBaseUrl);
