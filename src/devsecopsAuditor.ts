// Orion LMS DevSecOps Pipelines Configurations Auditor

export interface AuditReport {
  valid: boolean;
  violations: string[];
}

export class DevsecopsAuditor {
  // 1. Audit Open Policy Agent (OPA) rego policy files
  auditOPAPolicy(content: string): AuditReport {
    const violations: string[] = [];

    if (!content.includes("package ")) {
      violations.push("Configuration Error: Rego files must declare a 'package' namespace header.");
    }

    if (!content.includes("default allow = false")) {
      violations.push("Security Violation: Rego policy files must define a secure fallback rule ('default allow = false').");
    }

    if (!content.includes("allow {")) {
      violations.push("Configuration Error: Rego policy files must define an 'allow' rule mapping.");
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // 2. Audit GitLeaks configurations for secret scanning rules
  auditGitLeaksConfig(content: string): AuditReport {
    const violations: string[] = [];

    if (!content.includes("[[rules]]") && !content.includes("rules:")) {
      violations.push("Configuration Error: GitLeaks config must define at least one search rule ('rules').");
    }

    if (!content.includes("regex = ") && !content.includes("regex: ")) {
      violations.push("Configuration Error: GitLeaks scanning rules must define a 'regex' pattern to match credentials.");
    }

    // Best Practice: GitLeaks should define a commit hook parameters
    if (content.includes("secret") && !content.includes("entropy")) {
      violations.push("Optimization Warning: Scanning rules should define entropy checks to reduce false-positive reports.");
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }
}
