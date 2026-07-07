import { DevsecopsAuditor } from '../src/devsecopsAuditor';

describe('Orion LMS DevSecOps Pipelines Auditor Tests', () => {
  let auditor: DevsecopsAuditor;

  beforeEach(() => {
    auditor = new DevsecopsAuditor();
  });

  describe('Open Policy Agent (OPA) compliance checks', () => {
    test('should pass validation on correct rego policy rules', () => {
      const content = `
        package lms.security
        default allow = false
        allow {
          input.tag != "latest"
        }
      `;
      const report = auditor.auditOPAPolicy(content);

      expect(report.valid).toBe(true);
      expect(report.violations).toHaveLength(0);
    });

    test('should flag rego policies missing secure default allow rules', () => {
      const content = `
        package lms.security
        allow {
          input.tag != "latest"
        }
      `; // Missing default allow = false
      const report = auditor.auditOPAPolicy(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("must define a secure fallback rule");
    });

    test('should flag rego policies missing packages headers', () => {
      const content = `
        default allow = false
        allow {
          input.tag != "latest"
        }
      `; // Missing package header
      const report = auditor.auditOPAPolicy(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("must declare a 'package' namespace header");
    });
  });

  describe('GitLeaks secret scanning configuration audits', () => {
    test('should pass verification on secure scanning patterns', () => {
      const content = `
        [[rules]]
          description = "AWS Manager Access Key"
          regex = "AKIA[0-9A-Z]{16}"
      `;
      const report = auditor.auditGitLeaksConfig(content);

      expect(report.valid).toBe(true);
      expect(report.violations).toHaveLength(0);
    });

    test('should flag configurations lacking rules properties', () => {
      const content = `
        description = "AWS Key"
        regex = "AKIA[0-9A-Z]{16}"
      `; // Missing rules header
      const report = auditor.auditGitLeaksConfig(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("must define at least one search rule");
    });

    test('should flag configurations lacking regex matching patterns', () => {
      const content = `
        [[rules]]
          description = "AWS Key"
      `; // Missing regex
      const report = auditor.auditGitLeaksConfig(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("must define a 'regex' pattern");
    });
  });
});
