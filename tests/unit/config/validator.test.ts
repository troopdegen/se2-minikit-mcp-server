/**
 * Configuration validator tests
 * Comprehensive tests for configuration validation with valid and invalid cases
 */

import { describe, test, expect } from 'bun:test';
import {
  validateProjectConfig,
  validateContractConfig,
  validateContractsConfig,
  validateMinikitConfig,
  validateConfigFromContent,
  detectConfigFormat,
  formatValidationErrors,
  parseConfig,
  isProjectConfig,
  isContractConfig,
  isMinikitConfig,
  mergeConfigs,
  ConfigType,
  ProjectConfigSchema,
  EXAMPLE_PROJECT_CONFIG,
  EXAMPLE_ERC20_CONTRACT,
  EXAMPLE_MINIKIT_CONFIG,
} from '../../../src/types/config.js';

describe('Configuration Validator', () => {
  describe('Project Configuration', () => {
    test('validates valid project config', () => {
      const result = validateProjectConfig(EXAMPLE_PROJECT_CONFIG);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    test('validates minimal project config', () => {
      const minimalConfig = {
        project: {
          name: 'test-project',
          description: 'A test project',
        },
        network: {
          network: 'base-sepolia',
        },
        template: 'basic',
        minikit: false,
      };

      const result = validateProjectConfig(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).project.version).toBe('1.0.0'); // default value
      }
    });

    test('rejects invalid project name', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        project: {
          ...EXAMPLE_PROJECT_CONFIG.project,
          name: 'invalid name!', // spaces and special chars not allowed
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.path.join('.')).toContain('name');
    });

    test('rejects invalid network type', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        network: {
          network: 'invalid-network',
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    test('rejects invalid version format', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        project: {
          ...EXAMPLE_PROJECT_CONFIG.project,
          version: 'not-semver',
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain('semver');
    });

    test('validates with optional build config', () => {
      const configWithBuild = {
        ...EXAMPLE_PROJECT_CONFIG,
        build: {
          outDir: 'dist',
          cacheDir: '.cache',
          sourceMaps: true,
          optimize: true,
          optimizerRuns: 200,
        },
      };

      const result = validateProjectConfig(configWithBuild);
      expect(result.success).toBe(true);
    });

    test('validates with optional dev server config', () => {
      const configWithDevServer = {
        ...EXAMPLE_PROJECT_CONFIG,
        devServer: {
          port: 8080,
          host: '0.0.0.0',
          hotReload: true,
          openBrowser: false,
        },
      };

      const result = validateProjectConfig(configWithDevServer);
      expect(result.success).toBe(true);
    });

    test('rejects invalid port number', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        devServer: {
          port: 100, // too low, must be >= 1024
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Contract Configuration', () => {
    test('validates valid ERC-20 contract config', () => {
      const result = validateContractConfig(EXAMPLE_ERC20_CONTRACT);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('validates ERC-721 contract config', () => {
      const erc721Config = {
        name: 'MyNFT',
        type: 'erc721',
        erc721: {
          name: 'My NFT Collection',
          symbol: 'MNFT',
          maxSupply: 10000,
          mintable: true,
          burnable: false,
          enumerable: true,
          uriStorage: true,
        },
        deployment: {},
        accessControl: { enabled: false },
        upgradeability: { enabled: false },
      };

      const result = validateContractConfig(erc721Config);
      expect(result.success).toBe(true);
    });

    test('rejects invalid contract name (not PascalCase)', () => {
      const invalidConfig = {
        ...EXAMPLE_ERC20_CONTRACT,
        name: 'myToken', // must start with uppercase
      };

      const result = validateContractConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain('PascalCase');
    });

    test('rejects invalid token symbol (lowercase)', () => {
      const invalidConfig = {
        ...EXAMPLE_ERC20_CONTRACT,
        erc20: {
          ...EXAMPLE_ERC20_CONTRACT.erc20!,
          symbol: 'mtk', // must be uppercase
        },
      };

      const result = validateContractConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('rejects invalid initial supply (non-numeric)', () => {
      const invalidConfig = {
        ...EXAMPLE_ERC20_CONTRACT,
        erc20: {
          ...EXAMPLE_ERC20_CONTRACT.erc20!,
          initialSupply: 'not-a-number',
        },
      };

      const result = validateContractConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('rejects invalid decimals (out of range)', () => {
      const invalidConfig = {
        ...EXAMPLE_ERC20_CONTRACT,
        erc20: {
          ...EXAMPLE_ERC20_CONTRACT.erc20!,
          decimals: 19, // max is 18
        },
      };

      const result = validateContractConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('validates constructor args', () => {
      const configWithArgs = {
        ...EXAMPLE_ERC20_CONTRACT,
        deployment: {
          constructorArgs: [
            {
              name: 'initialOwner',
              type: 'address',
              value: '0x1234567890123456789012345678901234567890',
            },
            {
              name: 'cap',
              type: 'uint256',
              value: '1000000',
            },
          ],
        },
      };

      const result = validateContractConfig(configWithArgs);
      expect(result.success).toBe(true);
    });

    test('validates multiple contracts', () => {
      const multiConfig = {
        contracts: [EXAMPLE_ERC20_CONTRACT, EXAMPLE_ERC20_CONTRACT],
      };

      const result = validateContractsConfig(multiConfig);
      expect(result.success).toBe(true);
    });

    test('rejects empty contracts array', () => {
      const emptyConfig = {
        contracts: [],
      };

      const result = validateContractsConfig(emptyConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Minikit Configuration', () => {
    test('validates valid Minikit config', () => {
      const result = validateMinikitConfig(EXAMPLE_MINIKIT_CONFIG);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('rejects non-HTTPS icon URL', () => {
      const invalidConfig = {
        ...EXAMPLE_MINIKIT_CONFIG,
        manifest: {
          ...EXAMPLE_MINIKIT_CONFIG.manifest,
          iconUrl: 'http://example.com/icon.png', // must be HTTPS
        },
      };

      const result = validateMinikitConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('rejects non-HTTPS domain', () => {
      const invalidConfig = {
        ...EXAMPLE_MINIKIT_CONFIG,
        domain: {
          domain: 'http://example.com', // must be HTTPS
        },
      };

      const result = validateMinikitConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('validates frame with buttons', () => {
      const configWithButtons = {
        ...EXAMPLE_MINIKIT_CONFIG,
        frame: {
          ...EXAMPLE_MINIKIT_CONFIG.frame!,
          buttons: [
            { label: 'Button 1', action: 'https://example.com/1', index: 1 },
            { label: 'Button 2', action: 'https://example.com/2', index: 2 },
          ],
        },
      };

      const result = validateMinikitConfig(configWithButtons);
      expect(result.success).toBe(true);
    });

    test('rejects too many buttons', () => {
      const invalidConfig = {
        ...EXAMPLE_MINIKIT_CONFIG,
        frame: {
          ...EXAMPLE_MINIKIT_CONFIG.frame!,
          buttons: [
            { label: 'B1', action: 'https://example.com/1', index: 1 },
            { label: 'B2', action: 'https://example.com/2', index: 2 },
            { label: 'B3', action: 'https://example.com/3', index: 3 },
            { label: 'B4', action: 'https://example.com/4', index: 4 },
            { label: 'B5', action: 'https://example.com/5', index: 5 }, // max 4
          ],
        },
      };

      const result = validateMinikitConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('rejects duplicate button indices', () => {
      const invalidConfig = {
        ...EXAMPLE_MINIKIT_CONFIG,
        frame: {
          ...EXAMPLE_MINIKIT_CONFIG.frame!,
          buttons: [
            { label: 'B1', action: 'https://example.com/1', index: 1 },
            { label: 'B2', action: 'https://example.com/2', index: 1 }, // duplicate index
          ],
        },
      };

      const result = validateMinikitConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain('unique');
    });

    test('validates wallet config with multiple chains', () => {
      const configWithChains = {
        ...EXAMPLE_MINIKIT_CONFIG,
        wallet: {
          enabled: true,
          supportedChains: ['base', 'base-sepolia'],
          autoConnect: true,
          showWalletUI: true,
        },
      };

      const result = validateMinikitConfig(configWithChains);
      expect(result.success).toBe(true);
    });

    test('rejects empty supported chains', () => {
      const invalidConfig = {
        ...EXAMPLE_MINIKIT_CONFIG,
        wallet: {
          enabled: true,
          supportedChains: [], // must have at least one
          autoConnect: false,
          showWalletUI: true,
        },
      };

      const result = validateMinikitConfig(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Format Detection and Parsing', () => {
    test('detects JSON format', () => {
      expect(detectConfigFormat('config.json')).toBe('json');
      expect(detectConfigFormat('project.config.json')).toBe('json');
    });

    test('detects YAML format', () => {
      expect(detectConfigFormat('config.yaml')).toBe('yaml');
      expect(detectConfigFormat('config.yml')).toBe('yaml');
    });

    test('throws on unknown format', () => {
      expect(() => detectConfigFormat('config.txt')).toThrow();
    });

    test('parses valid JSON', () => {
      const json = JSON.stringify(EXAMPLE_PROJECT_CONFIG);
      const parsed = parseConfig(json, 'json');
      expect(parsed).toEqual(EXAMPLE_PROJECT_CONFIG);
    });

    test('parses valid YAML', () => {
      const yaml = `
project:
  name: test-project
  description: Test
network:
  network: base-sepolia
template: basic
minikit: false
`;
      const parsed = parseConfig(yaml, 'yaml');
      expect(parsed).toBeDefined();
      expect((parsed as any).project.name).toBe('test-project');
    });

    test('throws on invalid JSON', () => {
      expect(() => parseConfig('{ invalid json }', 'json')).toThrow();
    });

    test('throws on invalid YAML', () => {
      expect(() => parseConfig('invalid:\n  - yaml\n  no indent', 'yaml')).toThrow();
    });
  });

  describe('End-to-End Validation', () => {
    test('validates project config from JSON content', () => {
      const json = JSON.stringify(EXAMPLE_PROJECT_CONFIG);
      const result = validateConfigFromContent(json, 'json', ConfigType.PROJECT);
      expect(result.success).toBe(true);
    });

    test('validates contract config from YAML content', () => {
      const yaml = `
name: MyToken
type: erc20
erc20:
  name: My Token
  symbol: MTK
  initialSupply: "1000000"
  decimals: 18
  mintable: true
  burnable: false
  pausable: false
deployment:
  confirmations: 1
accessControl:
  enabled: false
upgradeability:
  enabled: false
`;
      const result = validateConfigFromContent(yaml, 'yaml', ConfigType.CONTRACT);
      expect(result.success).toBe(true);
    });

    test('formats validation errors', () => {
      const invalidConfig = {
        project: {
          name: '', // empty name
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);

      const formatted = formatValidationErrors(result.errors || []);
      expect(formatted).toContain('name');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('Type Guard Functions', () => {
    test('isProjectConfig returns true for valid config', () => {
      expect(isProjectConfig(EXAMPLE_PROJECT_CONFIG)).toBe(true);
    });

    test('isProjectConfig returns false for invalid config', () => {
      expect(isProjectConfig({ invalid: 'config' })).toBe(false);
    });

    test('isContractConfig returns true for valid config', () => {
      expect(isContractConfig(EXAMPLE_ERC20_CONTRACT)).toBe(true);
    });

    test('isContractConfig returns false for invalid config', () => {
      expect(isContractConfig({ invalid: 'config' })).toBe(false);
    });

    test('isMinikitConfig returns true for valid config', () => {
      expect(isMinikitConfig(EXAMPLE_MINIKIT_CONFIG)).toBe(true);
    });

    test('isMinikitConfig returns false for invalid config', () => {
      expect(isMinikitConfig({ invalid: 'config' })).toBe(false);
    });
  });

  describe('Configuration Merging', () => {
    test('merges valid configurations', () => {
      const base = {
        project: {
          name: 'base-project',
          description: 'Base config',
        },
        network: {
          network: 'base-sepolia' as const,
        },
        template: 'basic' as const,
        minikit: false,
      };

      const override = {
        project: {
          name: 'overridden-project',
        },
      };

      const result = mergeConfigs(ProjectConfigSchema, base, override);
      expect(result.success).toBe(true);
      expect(result.data?.project.name).toBe('overridden-project');
      expect(result.data?.network.network).toBe('base-sepolia'); // preserved from base
    });

    test('rejects merge with invalid base', () => {
      const base = { invalid: 'config' };
      const override = { project: { name: 'test' } };

      const result = mergeConfigs(ProjectConfigSchema, base, override);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.path[0]).toBe('base');
    });

    test('rejects merge resulting in invalid config', () => {
      const base = EXAMPLE_PROJECT_CONFIG;
      const override = {
        project: {
          name: 'invalid name!', // spaces not allowed
        },
      };

      const result = mergeConfigs(ProjectConfigSchema, base, override);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Message Quality', () => {
    test('provides clear error message for missing field', () => {
      const invalidConfig = {
        project: {
          // missing name
          description: 'Test',
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toBeDefined();
    });

    test('provides clear error message for wrong type', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        minikit: 'yes', // should be boolean
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('provides clear error message for invalid format', () => {
      const invalidConfig = {
        ...EXAMPLE_PROJECT_CONFIG,
        project: {
          ...EXAMPLE_PROJECT_CONFIG.project,
          version: '1.0', // invalid semver
        },
      };

      const result = validateProjectConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain('semver');
    });
  });
});
