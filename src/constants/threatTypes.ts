import type { ThreatTypeOption } from '../types/urlquery';

export const THREAT_TYPES: ThreatTypeOption[] = [
  {
    value: 'phishing',
    label: 'Phishing',
    query: 'tags:phishing',
    description: 'Credential harvesting and fake login pages',
  },
  {
    value: 'malware',
    label: 'Malware',
    query: 'tags:malware',
    description: 'Malicious software distribution sites',
  },
  {
    value: 'suspicious',
    label: 'Suspicious',
    query: 'tags:suspicious',
    description: 'Potentially harmful or anomalous URLs',
  },
  {
    value: 'custom',
    label: 'Custom',
    query: '',
    description: 'Enter your own search query',
  },
];

export const TAG_COLORS: Record<string, string> = {
  'phishing': '#FF1744',
  'malware': '#D500F9',
  'spam': '#FF6D00',
  'exploit': '#F44336',
  'suspicious': '#FF9100',
  'cryptocurrency': '#00E676',
  'scam': '#E91E63',
  'trojan': '#9C27B0',
  'ransomware': '#C62828',
  'botnet': '#536DFE',
  'c2': '#7C4DFF',
  'javascript': '#FFC400',
  'redirect': '#2196F3',
  'download': '#00BCD4',
  'iframe': '#009688',
  'fake': '#FF5252',
  'fake_login': '#F50057',
  'credential': '#D32F2F',
  'banking': '#1976D2',
  'payment': '#0D47A1',
  'social': '#3F51B5',
  'microsoft': '#00A4EF',
  'netflix': '#E50914',
  'paypal': '#003087',
  'amazon': '#FF9900',
  'apple': '#A3AAAE',
  'google': '#4285F4',
  'facebook': '#1877F2',
  'instagram': '#E4405F',
  'twitter': '#1DA1F2',
  'linkedin': '#0A66C2',
  'spotify': '#1DB954',
  'dropbox': '#0061FF',
  'tiktok': '#FE2C55',
  'whatsapp': '#25D366',
  'telegram': '#0088CC',
  'discord': '#5865F2',
  'reddit': '#FF4500',
  'youtube': '#FF0000',
  'office': '#D83B01',
  'adobe': '#FF0000',
  'steam': '#1B2838',
  'roblox': '#00A2FF',
  'minecraft': '#62C94E',
  'gaming': '#6441A5',
  'login': '#FF6B6B',
  'password': '#FFA502',
  'account': '#48C9B0',
  'update': '#54A0FF',
  'verify': '#1ABC9C',
  'security': '#E74C3C',
  'alert': '#E67E22',
  'warning': '#F39C12',
  'notification': '#3498DB',
  'prize': '#9B59B6',
  'gift': '#F368E0',
  'offer': '#2ECC71',
  'sale': '#16A085',
  'free': '#27AE60',
  'win': '#8E44AD',
  'claim': '#2980B9',
  'urgent': '#C0392B',
  'limited': '#D35400',
  'expiring': '#E74C3C',
  'default': '#64748B'
};

const DISTINCT_COLORS = [
  '#FF1744', '#D500F9', '#00E676', '#FF6D00', '#536DFE',
  '#00BCD4', '#FFC400', '#E91E63', '#7C4DFF', '#009688',
  '#FF9100', '#2196F3', '#9C27B0', '#00E676', '#FF5252',
  '#1976D2', '#FF9900', '#00A4EF', '#1DB954', '#E4405F',
  '#FE2C55', '#25D366', '#0088CC', '#5865F2', '#FF4500',
  '#FF0000', '#62C94E', '#6441A5', '#FF6B6B', '#FFA502',
  '#48C9B0', '#54A0FF', '#1ABC9C', '#E74C3C', '#F39C12',
  '#3498DB', '#9B59B6', '#F368E0', '#2ECC71', '#8E44AD',
  '#2980B9', '#C0392B', '#D35400', '#16A085', '#27AE60'
];

let colorIndex = 0;

const tagColorCache = new Map<string, string>();

export function getTagColor(tag: string): string {
  if (tagColorCache.has(tag)) {
    return tagColorCache.get(tag)!;
  }

  const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (normalizedTag.includes(key.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
      tagColorCache.set(tag, color);
      return color;
    }
  }

  const color = DISTINCT_COLORS[colorIndex % DISTINCT_COLORS.length];
  colorIndex++;
  tagColorCache.set(tag, color);
  return color;
}
