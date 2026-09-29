// ============================================================
// ZentyRecon — Global Type Definitions
// ============================================================

// --- Extension Messaging --------------------------------

export type ModuleId =
  | 'tech-detector'
  | 'dom-extractor'
  | 'cookie-manager'
  | 'proxy-manager'
  | 'security-utils'
  | 'pqc-analyzer'
  | 'mosca-calc';

export type MessageType =
  | 'PING'
  | 'SCAN_PAGE'
  | 'SCAN_RESULT'
  | 'GET_COOKIES'
  | 'SET_PROXY'
  | 'PQC_SCORE'
  | 'SIDEPANEL_OPEN'
  | 'TAB_CHANGED'
  | 'MODULE_DATA'
  | 'GET_SECURITY_HEADERS';

export interface ZRMessage {
  type: MessageType;
  moduleId?: ModuleId;
  tabId?: number;
  payload?: unknown;
  timestamp: number;
}

export interface ZRResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// --- License -----------------------------------------------

export type LicenseTier = 'community' | 'pro' | 'enterprise';

export interface LicenseInfo {
  tier: LicenseTier;
  machineId: string;
  expiresAt: number | null; // null = lifetime
  isValid: boolean;
  features: string[];
}

// --- Tab Context -------------------------------------------

export interface TabContext {
  tabId: number;
  url: string;
  origin: string;
  title: string;
  favicon?: string;
}

// --- Module Data -------------------------------------------

export interface TechItem {
  name: string;
  category: 'framework' | 'crypto' | 'analytics' | 'cdn' | 'server' | 'other';
  version?: string;
  confidence: number; // 0–1
  isPqcRelevant: boolean;
  evidence?: string;
}

export interface TechDetectorResult {
  tabId: number;
  url: string;
  techs: TechItem[];
  tlsCipher?: string;
  tlsVersion?: string;
  keyExchange?: string;
  certExpiry?: string;
  scannedAt: number;
}

export interface ExtractedLink {
  href: string;
  text: string;
  type: 'internal' | 'external' | 'api' | 'form-action' | 'script' | 'media';
  isSecure: boolean;
}

export interface DomExtractorResult {
  tabId: number;
  url: string;
  links: ExtractedLink[];
  forms: { action: string; method: string; inputs: string[] }[];
  scripts: string[];
  scannedAt: number;
}

export interface PqcScore {
  score: number; // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  cipherSuite: string;
  keyExchange: string;
  isPqcHybrid: boolean;
  isFullPqc: boolean;
  recommendations: string[];
}

export interface MoscaResult {
  y: number; // Data shelf-life (years)
  x: number; // Migration time (years)
  z: number; // Q-Day estimate (years)
  isAtRisk: boolean;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

// --- Storage -----------------------------------------------

export interface ZRStorage {
  license?: LicenseInfo;
  proxyProfiles?: ProxyProfile[];
  activeProxyId?: string;
  settings?: ZRSettings;
}

export interface ProxyProfile {
  id: string;
  name: string;
  type: 'direct' | 'http' | 'https' | 'socks4' | 'socks5';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  urlPatterns?: string[];
  isActive: boolean;
  createdAt: number;
}

export interface ZRSettings {
  autoScanOnPageLoad: boolean;
  showPqcBadge: boolean;
  defaultModule: ModuleId;
  theme: 'dark' | 'light' | 'system';
}
