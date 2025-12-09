export const BRAND_COLORS: Record<string, string> = {
  'microsoft': '#00A4EF',
  'netflix': '#E50914',
  'paypal': '#00457C',
  'amazon': '#FF9900',
  'apple': '#555555',
  'google': '#4285F4',
  'facebook': '#1877F2',
  'instagram': '#E4405F',
  'twitter': '#1DA1F2',
  'linkedin': '#0A66C2',
  'spotify': '#1DB954',
  'dropbox': '#0061FF',
  'adobe': '#FF0000',
  'salesforce': '#00A1E0',
  'slack': '#4A154B',
  'zoom': '#2D8CFF',
  'ebay': '#E53238',
  'walmart': '#0071CE',
  'target': '#CC0000',
  'chase': '#117ACA',
  'wellsfargo': '#D71E28',
  'bankofamerica': '#E31837',
  'usbank': '#0A2240',
  'citibank': '#003D6A',
  'americanexpress': '#006FCF',
  'visa': '#1A1F71',
  'mastercard': '#EB001B',
  'discover': '#FF6000',
  'dhl': '#FFCC00',
  'fedex': '#4D148C',
  'ups': '#351C15',
  'usps': '#333366',
  'att': '#00A8E0',
  'verizon': '#CD040B',
  'tmobile': '#E20074',
  'comcast': '#0089CF',
  'default': '#64748B'
};

export function getBrandColor(brand: string | null): string {
  if (!brand) return BRAND_COLORS.default;

  const normalizedBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BRAND_COLORS[normalizedBrand] || BRAND_COLORS.default;
}
