import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  const code = url.searchParams.get('code') ?? '';
  const name = url.searchParams.get('name') ?? '';
  const checkIn = url.searchParams.get('checkIn') ?? '';
  const checkOut = url.searchParams.get('checkOut') ?? '';
  const addToWalletLink = url.searchParams.get('addToWalletLink') ?? '';

  return { name, code, checkIn, checkOut, addToWalletLink };
};

