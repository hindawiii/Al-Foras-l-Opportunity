import { describe, it, expect } from "vitest";
import { isSafePublicUrl } from "../../server/securityUtils";

describe("SSRF Defense & URL Validation Security Tests", () => {
  it("allows safe, legitimate public URLs", () => {
    const validUrls = [
      "https://oxford.ac.uk/admissions",
      "https://www.daad.de/en/find-funding",
      "https://scholarships.gov.sa/programs",
      "http://example.com/jobs/123",
      "https://careers.google.com/jobs/results",
    ];

    for (const url of validUrls) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected ${url} to be safe`).toBe(true);
      expect(res.normalizedUrl).toBeDefined();
    }
  });

  it("blocks localhost, loopback and 0.0.0.0 addresses", () => {
    const dangerous = [
      "http://localhost:3000/api/secret",
      "http://127.0.0.1:8080/admin",
      "http://127.0.0.2",
      "http://0.0.0.0:80",
      "http://[::1]/internal",
    ];

    for (const url of dangerous) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected ${url} to be blocked`).toBe(false);
    }
  });

  it("blocks cloud metadata service endpoints (AWS/GCP/Azure)", () => {
    const cloudMetadata = [
      "http://169.254.169.254/computeMetadata/v1",
      "http://169.254.169.254/latest/meta-data/",
      "http://metadata.google.internal/computeMetadata/v1",
      "http://metadata.goog",
      "http://instance-data",
    ];

    for (const url of cloudMetadata) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected cloud metadata endpoint ${url} to be blocked`).toBe(false);
    }
  });

  it("blocks private intranet IP ranges (10.x, 192.168.x, 172.16-31.x)", () => {
    const privateIps = [
      "http://10.0.0.1/admin",
      "http://10.255.255.254/health",
      "http://192.168.1.1/router",
      "http://192.168.0.254",
      "http://172.16.0.5:8080",
      "http://172.31.255.255",
    ];

    for (const url of privateIps) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected private IP ${url} to be blocked`).toBe(false);
    }
  });

  it("blocks invalid protocols (file, ftp, gopher, javascript)", () => {
    const badProtocols = [
      "file:///etc/passwd",
      "ftp://ftp.example.com",
      "gopher://gopher.example.com",
      "javascript:alert(1)",
    ];

    for (const url of badProtocols) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected non-HTTP protocol ${url} to be blocked`).toBe(false);
    }
  });

  it("blocks dangerous non-web ports", () => {
    const badPorts = [
      "http://example.com:22/ssh",
      "http://example.com:25/smtp",
      "http://example.com:3306/mysql",
      "http://example.com:5432/postgres",
      "http://example.com:6379/redis",
    ];

    for (const url of badPorts) {
      const res = isSafePublicUrl(url);
      expect(res.isSafe, `Expected bad port ${url} to be blocked`).toBe(false);
    }
  });
});
