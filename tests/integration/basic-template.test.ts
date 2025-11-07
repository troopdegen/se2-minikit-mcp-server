import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { TemplateEngine } from "../../src/engines/index.js";
import { createLogger } from "../../src/utils/logger.js";
import { readFileSync, rmSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

describe("Basic Template Integration", () => {
  const templatesDir = join(process.cwd(), "templates");
  const outputDir = join(process.cwd(), "test-output");
  let engine: TemplateEngine;

  beforeAll(() => {
    const logger = createLogger({ logLevel: "error", prettyLogs: false }); // Quiet logging for tests
    engine = new TemplateEngine(logger, { templatesDir });
  });

  beforeEach(() => {
    // Clean up and recreate test output directory before each test
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
    mkdirSync(outputDir, { recursive: true });
  });

  afterAll(() => {
    // Clean up test output
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });

  describe("Template Loading", () => {
    it("should load basic template", async () => {
      const templates = await engine.listTemplates();
      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);

      const basicTemplate = templates.find((t) => t.name === "basic");
      expect(basicTemplate).toBeDefined();
      expect(basicTemplate?.name).toBe("basic");
      expect(basicTemplate?.metadata).toBeDefined();
    });

    it("should validate basic template", async () => {
      const result = await engine.validateTemplate("basic");
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });
  });

  describe("Variable Substitution", () => {
    it("should generate project with variables", async () => {
      const variables = {
        projectName: "my-test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "TestContract",
      };

      await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      // Check package.json has substituted variables
      const packageJson = JSON.parse(
        readFileSync(join(outputDir, "package.json"), "utf-8")
      );
      expect(packageJson.name).toBe("my-test-project");
      expect(packageJson.author).toBe("Test Author");
      expect(packageJson.description).toBe("Test Description");
    });

    it("should substitute contract name", async () => {
      const variables = {
        projectName: "my-test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "MyGreeter",
      };

      await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      // Check contract file exists with correct name
      const contractPath = join(outputDir, "contracts", "MyGreeter.sol");
      expect(existsSync(contractPath)).toBe(true);

      // Check contract content
      const contractContent = readFileSync(contractPath, "utf-8");
      expect(contractContent).toContain("contract MyGreeter");
    });

    it("should substitute network in hardhat config", async () => {
      const variables = {
        projectName: "my-test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base",
        contractName: "TestContract",
      };

      await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      // Check hardhat.config.ts
      const configContent = readFileSync(
        join(outputDir, "hardhat.config.ts"),
        "utf-8"
      );
      expect(configContent).toContain('defaultNetwork: "base"');
    });
  });

  describe("File Structure", () => {
    it("should generate all required files", async () => {
      const variables = {
        projectName: "my-test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "TestContract",
      };

      await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      // Check base files
      expect(existsSync(join(outputDir, "package.json"))).toBe(true);
      expect(existsSync(join(outputDir, "README.md"))).toBe(true);
      expect(existsSync(join(outputDir, "hardhat.config.ts"))).toBe(true);
      expect(existsSync(join(outputDir, ".env.example"))).toBe(true);
      expect(existsSync(join(outputDir, ".gitignore"))).toBe(true);

      // Check contract files
      expect(
        existsSync(join(outputDir, "contracts", "TestContract.sol"))
      ).toBe(true);

      // Check deployment files
      expect(
        existsSync(join(outputDir, "deploy", "00_deploy_contract.ts"))
      ).toBe(true);

      // Check test files
      expect(existsSync(join(outputDir, "test", "TestContract.ts"))).toBe(
        true
      );

      // Check Next.js files
      expect(existsSync(join(outputDir, "nextjs", "package.json"))).toBe(true);
      expect(existsSync(join(outputDir, "nextjs", "app", "layout.tsx"))).toBe(
        true
      );
      expect(existsSync(join(outputDir, "nextjs", "app", "page.tsx"))).toBe(
        true
      );
      expect(
        existsSync(join(outputDir, "nextjs", "components", "Header.tsx"))
      ).toBe(true);
      expect(existsSync(join(outputDir, "nextjs", "tsconfig.json"))).toBe(
        true
      );
      expect(existsSync(join(outputDir, "nextjs", "next.config.js"))).toBe(
        true
      );
    });

    it("should create proper directory structure", async () => {
      const variables = {
        projectName: "my-test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "TestContract",
      };

      await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      // Check directories exist
      expect(existsSync(join(outputDir, "contracts"))).toBe(true);
      expect(existsSync(join(outputDir, "deploy"))).toBe(true);
      expect(existsSync(join(outputDir, "test"))).toBe(true);
      expect(existsSync(join(outputDir, "nextjs"))).toBe(true);
      expect(existsSync(join(outputDir, "nextjs", "app"))).toBe(true);
      expect(existsSync(join(outputDir, "nextjs", "components"))).toBe(true);
    });
  });

  describe("Template Preview", () => {
    it("should generate preview of files", async () => {
      const variables = {
        projectName: "preview-project",
        author: "Preview Author",
        description: "Preview Description",
        network: "base-sepolia",
        contractName: "PreviewContract",
      };

      const preview = await engine.preview({
        template: "basic",
        destination: outputDir,
        variables,
      });

      expect(preview).toBeDefined();
      expect(preview.success).toBe(true);
      expect(preview.files.length).toBeGreaterThan(0);

      // Check that preview contains key files (preview returns full paths)
      expect(preview.files.some((f: string) => f.endsWith("package.json"))).toBe(true);
      expect(preview.files.some((f: string) => f.includes("PreviewContract.sol"))).toBe(true);
      expect(preview.files.some((f: string) => f.includes("page.tsx"))).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should succeed with missing variables that have defaults", async () => {
      const variables = {
        projectName: "test-project",
        // Other variables will use defaults (author: "Anonymous", etc.)
      };

      const result = await engine.generate({
        template: "basic",
        destination: outputDir,
        variables,
        overwrite: true,
      });

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it("should fail with invalid project name pattern", async () => {
      const variables = {
        projectName: "Invalid Project Name!", // Contains spaces and special chars
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "TestContract",
      };

      await expect(
        engine.generate({
          template: "basic",
          destination: outputDir,
          variables,
          overwrite: true,
        })
      ).rejects.toThrow();
    });

    it("should fail with non-existent template", async () => {
      const variables = {
        projectName: "test-project",
        author: "Test Author",
        description: "Test Description",
        network: "base-sepolia",
        contractName: "TestContract",
      };

      await expect(
        engine.generate({
          template: "non-existent-template",
          destination: outputDir,
          variables,
          overwrite: true,
        })
      ).rejects.toThrow();
    });
  });
});
