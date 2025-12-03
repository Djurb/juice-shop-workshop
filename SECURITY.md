# Security Policy

Application Tier: Tier 1
- Block Policy: All critical and high severity vulnerabilities will be blocked in the pipeline

Application Tier: Tier 2
- Block Policy: All critical severity vulnerabilities that are direct dependencies only will be blocked in the pipeline

Application Tier: Tier 3
- Block Policy: Only block issues that have a CWE-327

# AI Usage Policy

Only the following families of models are allowed to be used:
- Llama
- GPT-4, GPT-5 (or any model from OpenAI)
- Claude Sonnet
