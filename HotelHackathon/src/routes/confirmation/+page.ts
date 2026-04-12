import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
  const code = url.searchParams.get('code');
  const name = url.searchParams.get('name');
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');
  const addToWalletLink = url.searchParams.get('addToWalletLink');

  console.log('🔍 CONFIRMATION PAGE LOADED');
  console.log('📋 URL Parameters:', { code, name, checkIn, checkOut, addToWalletLink });

  if (!code) {
    console.log('❌ No code parameter found in URL');
    return { name: name || '', code: '', checkIn: checkIn || '', checkOut: checkOut || '', addToWalletLink: addToWalletLink || '' };
  }

  try {
    console.log(`🔄 Fetching reservation data from: /api/reservations/${code}`);
    const response = await fetch(`/api/reservations/${code}`);

    console.log(`📡 API Response Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ API Response Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const reservation = await response.json();
    console.log('✅ Reservation data from API:', JSON.stringify(reservation, null, 2));

   const result = {
        name: name || '',
        code: code || '',
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        addToWalletLink: addToWalletLink || ''
    };

    console.log('📋 Final data being returned to page:', result);
    return result;

  } catch (error) {
    console.error('💥 Failed to fetch reservation:', error);
    console.log('🔄 Falling back to URL parameters only');

    // Return URL parameters as fallback
    return {
      name: name || '',
      code: code || '',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      addToWalletLink: addToWalletLink || ''
    };
  }
};

