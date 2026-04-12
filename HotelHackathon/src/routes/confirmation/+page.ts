import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const code = url.searchParams.get('code');

  if (!code) {
    return { name: '', code: '', checkIn: '', checkOut: '', addToWalletLink: '' };
  }

  try {
    const response = await fetch(`/api/reservations/${code}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reservation = await response.json();

    return {
      name: reservation.name ?? '',
      code: reservation.code ?? '',
      checkIn: reservation.checkIn ?? '',
      checkOut: reservation.checkOut ?? '',
      addToWalletLink: reservation.addToWalletLink ?? ''
    };
  } catch (error) {
    console.error('Failed to fetch reservation:', error);
    return { name: '', code: '', checkIn: '', checkOut: '', addToWalletLink: '' };
  }
};

