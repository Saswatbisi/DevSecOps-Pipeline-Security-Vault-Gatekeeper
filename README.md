# DevSecOps Pipeline Security, Secrets Management & Compliance as Code

This repository contains a complete implementation of modern DevSecOps security controls, automated code security gates, secrets management, and runtime policy enforcement for a Node.js Express application.

---

## 📁 Repository Structure

```
├── .github/workflows/
│   └── security.yml             # GitHub Actions security pipeline configuration
├── opa/
│   ├── policy.rego              # Simple OPA rego rules
│   ├── gatekeeper-policy.yaml   # ConstraintTemplate & Constraint manifests for Kubernetes
│   └── test-pods.yaml           # Pod resource limit compliance test configurations
├── src/
│   ├── config/db.ts             # MongoDB database connection configuration
│   ├── middlewares/             # Request middlewares (authentication & error handlers)
│   ├── models/User.ts           # Mongoose Database User model
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes (JWT registration/login)
│   │   ├── users.ts             # User profiles & dashboard routes
│   │   └── vulnerable.ts        # Route containing a deliberate SQL injection vulnerability
│   └── app.ts                   # Express server initialization
├── Dockerfile                   # Multi-stage Docker container specification
├── package.json                 # Node package configuration & dependency declarations
├── trivy-report.txt             # Trivy container scan vulnerability report
└── README.md                    # Project documentation (this file)
```

---

## 🔒 Part A: Pipeline Security Gates

### 1. GitLeaks (Secret Scanning Hook)
*   **Location:** Installed locally inside `.git/hooks/pre-commit` running `gitleaks protect --staged --verbose`.
*   **Verification:** Any commit containing hardcoded credentials (such as active AWS key patterns: `AKIA...`) is automatically blocked with a non-zero exit code.
*   **Setup locally:** Copy/create the hook:
    ```bash
    cp .git/hooks/pre-commit bin/gitleaks.exe
    ```

### 2. Semgrep (Static Application Security Testing - SAST)
*   **Vulnerability:** A deliberate SQL Injection is introduced at [src/routes/vulnerable.ts](src/routes/vulnerable.ts) using raw template literal string concatenation inside database query scopes.
*   **Pipeline integration:** Configured using `semgrep ci --config=auto`.
*   **Local Scan Simulation:**
    ```bash
    docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config=auto --exclude="node_modules" --exclude="bin"
    ```

### 3. OWASP Dependency-Check (Software Composition Analysis - SCA)
*   **Pipeline Integration:** Configured using `uses: dependency-check/Dependency-Check_Action`.
*   **Mitigation:** Upgraded `jsonwebtoken` from version `8.5.1` (which contained HIGH severity CVE-2022-23529) to `9.0.0` and overridden `tar` to `7.5.16` to mitigate nested vulnerabilities. Checked using `npm audit` which reports **0 vulnerabilities**.

### 4. Trivy Container Vulnerability Scan
*   **Dockerization:** Build the image locally:
    ```bash
    docker build -t node-app:latest .
    ```
*   **Scan:** Runs `trivy image --exit-code 1 --severity CRITICAL` inside the pipeline to fail builds if critical security vulnerabilities are introduced inside base layers or package libraries. Local scan reports are captured inside `trivy-report.txt`.

---

## 🔑 Part B: Vault & Compliance-as-Code

### 5. HashiCorp Vault Integration
*   **Launch Vault (Dev Mode):**
    ```bash
    docker run -d --name vault-dev-server -p 8200:8200 -e "VAULT_DEV_ROOT_TOKEN_ID=myroottoken" hashicorp/vault
    ```
*   **Write DB Secret:**
    ```bash
    docker exec -e VAULT_ADDR="http://127.0.0.1:8200" -e VAULT_TOKEN="myroottoken" vault-dev-server vault kv put secret/db password="my-secure-db-password"
    ```
*   **API Secret Retrieval:**
    ```bash
    curl.exe --header "X-Vault-Token: myroottoken" http://127.0.0.1:8200/v1/secret/data/db
    ```

### 6. Kubernetes OPA Gatekeeper Compliance Policy
*   **Gatekeeper Installation:** Deployed on Minikube:
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml
    ```
*   **Enforcement:** Applying `opa/gatekeeper-policy.yaml` deploys a `ConstraintTemplate` checking that every container specifies cpu and memory limits, and a cluster-wide `Constraint`.
*   **Testing Policies:**
    ```bash
    kubectl apply -f opa/test-pods.yaml
    ```
    - `test-pod-with-limits` successfully creates the container.
    - `test-pod-no-limits` is immediately **rejected** with the error:
      `validation.gatekeeper.sh denied the request: container <nginx> does not have resource limits specified`
