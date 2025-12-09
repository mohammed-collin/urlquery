import { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import type { URLQuerySearchResult } from '../types/urlquery';
import { extractIPsFromURL, batchGetIPGeolocation } from '../services/geolocation';

interface CyberMapProps {
  results: URLQuerySearchResult[];
  onCountryClick?: (countryCode: string) => void;
}

interface IPLocation {
  ip: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
}

interface CountryThreatData {
  code: string;
  count: number;
  ips: string[];
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const ISO_ALPHA3_TO_ALPHA2: Record<string, string> = {
  'USA': 'US', 'CHN': 'CN', 'RUS': 'RU', 'DEU': 'DE', 'GBR': 'GB',
  'FRA': 'FR', 'NLD': 'NL', 'CAN': 'CA', 'BRA': 'BR', 'IND': 'IN',
  'JPN': 'JP', 'AUS': 'AU', 'KOR': 'KR', 'ITA': 'IT', 'ESP': 'ES',
  'POL': 'PL', 'SWE': 'SE', 'UKR': 'UA', 'TUR': 'TR', 'MEX': 'MX',
  'IDN': 'ID', 'THA': 'TH', 'VNM': 'VN', 'PHL': 'PH', 'MYS': 'MY',
  'SGP': 'SG', 'NOR': 'NO', 'DNK': 'DK', 'FIN': 'FI', 'BEL': 'BE',
  'CHE': 'CH', 'AUT': 'AT', 'CZE': 'CZ', 'PRT': 'PT', 'GRC': 'GR',
  'HUN': 'HU', 'ROU': 'RO', 'BGR': 'BG', 'HRV': 'HR', 'SRB': 'RS',
  'SVK': 'SK', 'SVN': 'SI', 'EST': 'EE', 'LVA': 'LV', 'LTU': 'LT',
  'IRL': 'IE', 'NZL': 'NZ', 'ARG': 'AR', 'CHL': 'CL', 'COL': 'CO',
  'PER': 'PE', 'VEN': 'VE', 'ZAF': 'ZA', 'EGY': 'EG', 'SAU': 'SA',
  'ARE': 'AE', 'ISR': 'IL', 'IRN': 'IR', 'IRQ': 'IQ', 'PAK': 'PK',
  'BGD': 'BD', 'LKA': 'LK', 'NPL': 'NP', 'AFG': 'AF', 'KAZ': 'KZ',
};

export default function CyberMap({ results, onCountryClick }: CyberMapProps) {
  const [hoveredIP, setHoveredIP] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [ipLocations, setIPLocations] = useState<IPLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const extractedIPs = useMemo(() => {
    const ips = new Set<string>();

    results.forEach(result => {
      if (result.ip) {
        ips.add(result.ip);
      }

      const urlIPs = extractIPsFromURL(result.url);
      urlIPs.forEach(ip => ips.add(ip));

      if (result.domain) {
        const domainIPs = extractIPsFromURL(result.domain);
        domainIPs.forEach(ip => ips.add(ip));
      }
    });

    const ipArray = Array.from(ips);
    console.log('CyberMap: Extracted IPs from results:', {
      totalResults: results.length,
      extractedIPs: ipArray.length,
      ips: ipArray,
      sampleResults: results.slice(0, 3).map(r => ({
        url: r.url,
        domain: r.domain,
        ip: r.ip,
        country: r.country,
        country_code: r.country_code,
      }))
    });

    return ipArray;
  }, [results]);

  const countryThreatData = useMemo(() => {
    const countryMap: Record<string, CountryThreatData> = {};

    ipLocations.forEach(location => {
      const code = location.country_code.toUpperCase();
      if (!countryMap[code]) {
        countryMap[code] = {
          code,
          count: 0,
          ips: [],
        };
      }
      countryMap[code].count++;
      if (!countryMap[code].ips.includes(location.ip)) {
        countryMap[code].ips.push(location.ip);
      }
    });

    console.log('CyberMap: Country threat aggregation:', countryMap);
    return countryMap;
  }, [ipLocations]);

  const maxThreatCount = useMemo(() => {
    return Math.max(...Object.values(countryThreatData).map(c => c.count), 1);
  }, [countryThreatData]);

  const getCountryColor = (geoId: string): string => {
    const alpha2Code = ISO_ALPHA3_TO_ALPHA2[geoId] || geoId;
    const threatData = countryThreatData[alpha2Code];

    if (!threatData) {
      return '#1e293b';
    }

    const intensity = threatData.count / maxThreatCount;

    if (intensity >= 0.75) {
      return '#991b1b';
    } else if (intensity >= 0.5) {
      return '#dc2626';
    } else if (intensity >= 0.25) {
      return '#ef4444';
    } else {
      return '#f87171';
    }
  };

  useEffect(() => {
    if (extractedIPs.length === 0) {
      setIPLocations([]);
      return;
    }

    let isCancelled = false;

    const fetchGeolocations = async () => {
      setLoading(true);
      console.log('CyberMap: Starting geolocation for IPs:', extractedIPs);
      try {
        const geoData = await batchGetIPGeolocation(extractedIPs);
        console.log('CyberMap: Geolocation results:', {
          requestedIPs: extractedIPs.length,
          resolvedIPs: geoData.size,
          geoData: Array.from(geoData.entries())
        });

        if (!isCancelled) {
          const locations: IPLocation[] = [];
          geoData.forEach((data, ip) => {
            if (data.latitude !== 0 || data.longitude !== 0) {
              locations.push({
                ip,
                latitude: data.latitude,
                longitude: data.longitude,
                country: data.country,
                country_code: data.country_code,
              });
            }
          });
          console.log('CyberMap: Setting IP locations:', locations);
          setIPLocations(locations);
        }
      } catch (error) {
        console.error('CyberMap: Failed to fetch geolocations:', error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchGeolocations();

    return () => {
      isCancelled = true;
    };
  }, [extractedIPs]);

  const hoveredIPData = hoveredIP ? ipLocations.find(loc => loc.ip === hoveredIP) : null;
  const hoveredCountryData = hoveredCountry ? countryThreatData[ISO_ALPHA3_TO_ALPHA2[hoveredCountry] || hoveredCountry] : null;

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full bg-slate-950/50 rounded-xl border border-cyan-500/20 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
          }}
          className="w-full h-full"
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoId = geo.id || geo.properties?.ISO_A3 || '';
                  const fillColor = getCountryColor(geoId);
                  const hasThreat = fillColor !== '#1e293b';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#334155"
                      strokeWidth={0.5}
                      onMouseEnter={(e) => {
                        if (hasThreat) {
                          setHoveredCountry(geoId);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                        if (!hoveredIP) {
                          setTooltipPos(null);
                        }
                      }}
                      onClick={() => {
                        const alpha2Code = ISO_ALPHA3_TO_ALPHA2[geoId] || geoId;
                        if (countryThreatData[alpha2Code]) {
                          onCountryClick?.(alpha2Code);
                        }
                      }}
                      style={{
                        default: { outline: 'none', cursor: hasThreat ? 'pointer' : 'default' },
                        hover: {
                          outline: 'none',
                          fill: hasThreat ? '#fca5a5' : '#334155',
                          cursor: hasThreat ? 'pointer' : 'default'
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {ipLocations.map((location) => {
              const coordinates: [number, number] = [location.longitude, location.latitude];

              return (
                <Marker key={location.ip} coordinates={coordinates}>
                  <g
                    onMouseEnter={(e) => {
                      setHoveredIP(location.ip);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => {
                      setHoveredIP(null);
                      if (!hoveredCountry) {
                        setTooltipPos(null);
                      }
                    }}
                    onClick={() => onCountryClick?.(location.country_code)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={6}
                      fill="#fef08a"
                      opacity={0.3}
                      className="animate-pulse"
                    />
                    <circle
                      r={3}
                      fill="#fef08a"
                      opacity={1}
                      className="transition-all hover:scale-125"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(254, 240, 138, 1))',
                      }}
                    />
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {loading && (
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-cyan-400">
          Geolocating IPs...
        </div>
      )}

      {hoveredIPData && tooltipPos && !hoveredCountry && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: tooltipPos.x + 20,
            top: tooltipPos.y - 20,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-yellow-500/50 rounded-lg px-4 py-3 shadow-2xl">
            <div className="text-sm font-bold text-yellow-400 mb-1 uppercase tracking-wide">
              {hoveredIPData.ip}
            </div>
            <div className="text-xs text-white space-y-1">
              <div>Country: <span className="font-bold text-yellow-400">{hoveredIPData.country}</span></div>
              <div className="text-slate-400">
                {hoveredIPData.latitude.toFixed(4)}, {hoveredIPData.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      {hoveredCountryData && tooltipPos && !hoveredIP && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 20,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-red-500/50 rounded-lg px-4 py-3 shadow-2xl">
            <div className="text-sm font-bold text-red-400 mb-1 uppercase tracking-wide">
              {hoveredCountryData.code}
            </div>
            <div className="text-xs text-white space-y-1">
              <div>Threats: <span className="font-bold text-red-400">{hoveredCountryData.count}</span></div>
              <div>IPs: <span className="font-bold text-red-400">{hoveredCountryData.ips.length}</span></div>
            </div>
          </div>
        </div>
      )}

      {!loading && ipLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-slate-500 text-center">
            <div className="text-lg font-semibold mb-2">No IP Data</div>
            <div className="text-sm">
              {results.length === 0
                ? 'Pull threat intelligence to see IP distribution'
                : 'No IPs detected in current results'}
            </div>
          </div>
        </div>
      )}

      {ipLocations.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-4 py-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            Threat Level
          </div>
          <div className="flex items-center gap-2 text-xs text-white">
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-[#f87171] rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-[#ef4444] rounded"></div>
              <span>Med</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-[#dc2626] rounded"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-[#991b1b] rounded"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
