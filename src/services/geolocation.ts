interface GeolocationResult {
  ip: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
}

const geolocationCache = new Map<string, GeolocationResult>();

export async function getIPGeolocation(ip: string): Promise<GeolocationResult | null> {
  if (typeof ip !== 'string' || !ip) {
    console.error('Invalid IP address provided:', ip);
    return null;
  }

  if (geolocationCache.has(ip)) {
    return geolocationCache.get(ip)!;
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for IP ${ip}`);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.warn(`Geolocation error for IP ${ip}:`, data.error);
      return null;
    }

    const result: GeolocationResult = {
      ip,
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'XX',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };

    geolocationCache.set(ip, result);
    return result;
  } catch (error) {
    console.error(`Failed to geolocate IP ${ip}:`, error);
    return null;
  }
}

export async function batchGetIPGeolocation(ips: string[]): Promise<Map<string, GeolocationResult>> {
  const validIps = ips.filter(ip => typeof ip === 'string' && ip.length > 0);
  const uniqueIps = [...new Set(validIps)];
  const results = new Map<string, GeolocationResult>();

  console.log('Batch geolocation: Processing IPs:', uniqueIps);

  const uncachedIps = uniqueIps.filter(ip => !geolocationCache.has(ip));
  console.log('Batch geolocation: Uncached IPs to lookup:', uncachedIps);

  const promises = uncachedIps.map(async (ip, index) => {
    await new Promise(resolve => setTimeout(resolve, index * 100));
    return getIPGeolocation(ip);
  });

  const geoResults = await Promise.all(promises);

  uniqueIps.forEach(ip => {
    if (geolocationCache.has(ip)) {
      results.set(ip, geolocationCache.get(ip)!);
    }
  });

  geoResults.forEach(result => {
    if (result) {
      results.set(result.ip, result);
    }
  });

  console.log('Batch geolocation: Completed with results:', results.size);
  return results;
}

export function extractIPsFromURL(url: string): string[] {
  const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const matches = url.match(ipv4Regex);
  return matches || [];
}
