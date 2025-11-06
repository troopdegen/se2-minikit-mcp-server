/**
 * Minikit configuration schema
 * Defines the structure and validation for Farcaster Minikit integration
 */

import { z } from 'zod';

/**
 * Frame aspect ratio
 */
export const FrameAspectRatioSchema = z.enum(['1:1', '1.91:1']);

/**
 * Manifest metadata schema
 */
export const ManifestMetadataSchema = z.object({
  /** App name displayed in Farcaster */
  name: z
    .string()
    .min(1, 'App name is required')
    .max(50, 'App name must be less than 50 characters'),

  /** Short app description */
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),

  /** App icon URL (must be HTTPS) */
  iconUrl: z
    .string()
    .url('Icon URL must be a valid URL')
    .regex(/^https:\/\//, 'Icon URL must use HTTPS'),

  /** App splash screen URL (optional) */
  splashImageUrl: z
    .string()
    .url('Splash image URL must be a valid URL')
    .regex(/^https:\/\//, 'Splash image URL must use HTTPS')
    .optional(),

  /** App home URL */
  homeUrl: z
    .string()
    .url('Home URL must be a valid URL')
    .regex(/^https:\/\//, 'Home URL must use HTTPS'),
});

/**
 * Domain configuration schema
 */
export const DomainConfigSchema = z.object({
  /** Primary domain (must be HTTPS) */
  domain: z
    .string()
    .regex(
      /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      'Domain must be a valid HTTPS URL'
    ),

  /** Additional allowed domains */
  additionalDomains: z
    .array(
      z
        .string()
        .regex(
          /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        )
    )
    .default([]),

  /** Enable www subdomain redirect */
  wwwRedirect: z.boolean().default(true),
});

/**
 * Frame configuration schema
 */
export const FrameConfigSchema = z.object({
  /** Frame version */
  version: z.enum(['vNext', 'v1']).default('vNext'),

  /** Frame title */
  title: z
    .string()
    .min(1, 'Frame title is required')
    .max(100, 'Frame title must be less than 100 characters'),

  /** Frame image URL */
  imageUrl: z
    .string()
    .url('Frame image URL must be a valid URL')
    .regex(/^https:\/\//, 'Frame image URL must use HTTPS'),

  /** Frame aspect ratio */
  aspectRatio: FrameAspectRatioSchema.default('1.91:1'),

  /** Frame buttons (1-4 buttons) */
  buttons: z
    .array(
      z.object({
        /** Button label */
        label: z.string().min(1).max(30, 'Button label must be less than 30 characters'),

        /** Button action URL */
        action: z
          .string()
          .url('Button action must be a valid URL')
          .regex(/^https:\/\//, 'Button action URL must use HTTPS'),

        /** Button index (1-4) */
        index: z.number().int().min(1).max(4),
      })
    )
    .min(1, 'At least one button is required')
    .max(4, 'Maximum 4 buttons allowed')
    .refine((buttons) => {
      const indices = buttons.map((b) => b.index);
      return new Set(indices).size === indices.length;
    }, 'Button indices must be unique')
    .optional(),

  /** Post URL for frame interactions */
  postUrl: z
    .string()
    .url('Post URL must be a valid URL')
    .regex(/^https:\/\//, 'Post URL must use HTTPS')
    .optional(),

  /** Input text placeholder */
  inputText: z.string().max(100, 'Input text must be less than 100 characters').optional(),
});

/**
 * Wallet integration configuration
 */
export const WalletConfigSchema = z.object({
  /** Enable wallet connection */
  enabled: z.boolean().default(true),

  /** Supported chains (Base mainnet/testnet) */
  supportedChains: z
    .array(z.enum(['base', 'base-sepolia']))
    .min(1, 'At least one chain is required')
    .default(['base-sepolia']),

  /** Request account access on load */
  autoConnect: z.boolean().default(false),

  /** Show wallet UI */
  showWalletUI: z.boolean().default(true),
});

/**
 * Identity verification configuration
 */
export const IdentityConfigSchema = z.object({
  /** Require Farcaster ID verification */
  requireVerification: z.boolean().default(false),

  /** Minimum FID age in days (optional) */
  minimumFidAge: z.number().int().min(0).optional(),

  /** Required account features */
  requiredFeatures: z
    .array(z.enum(['verified-address', 'verified-twitter', 'power-badge']))
    .default([]),
});

/**
 * Analytics configuration
 */
export const AnalyticsConfigSchema = z.object({
  /** Enable analytics tracking */
  enabled: z.boolean().default(false),

  /** Analytics provider */
  provider: z.enum(['google-analytics', 'mixpanel', 'custom']).optional(),

  /** Analytics tracking ID */
  trackingId: z.string().optional(),

  /** Custom analytics endpoint */
  customEndpoint: z
    .string()
    .url('Custom endpoint must be a valid URL')
    .regex(/^https:\/\//, 'Custom endpoint must use HTTPS')
    .optional(),
});

/**
 * API configuration for Minikit
 */
export const ApiConfigSchema = z.object({
  /** API base URL */
  baseUrl: z
    .string()
    .url('API base URL must be a valid URL')
    .regex(/^https:\/\//, 'API base URL must use HTTPS'),

  /** API timeout in milliseconds */
  timeout: z.number().int().positive().default(30000),

  /** Retry configuration */
  retries: z.number().int().min(0).max(5).default(3),

  /** API authentication token (optional) */
  authToken: z.string().optional(),
});

/**
 * Complete Minikit configuration schema
 */
export const MinikitConfigSchema = z.object({
  /** Manifest metadata */
  manifest: ManifestMetadataSchema,

  /** Domain configuration */
  domain: DomainConfigSchema,

  /** Frame configuration */
  frame: FrameConfigSchema.optional(),

  /** Wallet integration */
  wallet: WalletConfigSchema.default({
    enabled: true,
    supportedChains: ['base-sepolia'],
    autoConnect: false,
    showWalletUI: true,
  }),

  /** Identity verification */
  identity: IdentityConfigSchema.default({
    requireVerification: false,
    requiredFeatures: [],
  }),

  /** Analytics configuration */
  analytics: AnalyticsConfigSchema.default({
    enabled: false,
  }),

  /** API configuration */
  api: ApiConfigSchema.optional(),

  /** Custom metadata */
  custom: z.record(z.string(), z.unknown()).optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type FrameAspectRatio = z.infer<typeof FrameAspectRatioSchema>;
export type ManifestMetadata = z.infer<typeof ManifestMetadataSchema>;
export type DomainConfig = z.infer<typeof DomainConfigSchema>;
export type FrameConfig = z.infer<typeof FrameConfigSchema>;
export type WalletConfig = z.infer<typeof WalletConfigSchema>;
export type IdentityConfig = z.infer<typeof IdentityConfigSchema>;
export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;
export type ApiConfig = z.infer<typeof ApiConfigSchema>;
export type MinikitConfig = z.infer<typeof MinikitConfigSchema>;

/**
 * Example valid Minikit configuration
 */
export const EXAMPLE_MINIKIT_CONFIG: MinikitConfig = {
  manifest: {
    name: 'My DApp',
    description: 'A decentralized application on Base with Farcaster integration',
    iconUrl: 'https://example.com/icon.png',
    homeUrl: 'https://example.com',
  },
  domain: {
    domain: 'https://example.com',
    additionalDomains: ['https://app.example.com'],
    wwwRedirect: true,
  },
  frame: {
    version: 'vNext',
    title: 'My DApp Frame',
    imageUrl: 'https://example.com/frame.png',
    aspectRatio: '1.91:1',
    buttons: [
      {
        label: 'Open App',
        action: 'https://example.com/app',
        index: 1,
      },
    ],
  },
  wallet: {
    enabled: true,
    supportedChains: ['base-sepolia'],
    autoConnect: false,
    showWalletUI: true,
  },
  identity: {
    requireVerification: false,
    requiredFeatures: [],
  },
  analytics: {
    enabled: false,
  },
};
