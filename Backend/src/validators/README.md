# Validator Layer

Validators enforce schema boundaries and data integrity for HTTP request payloads (body, query, and params) using `express-validator`.

## Guidelines
- Write one validator group file per resource (e.g., `auth.validator.ts`, `college.validator.ts`).
- Combine `express-validator` validation chains with the `validate` middleware to automatically reject requests with 422 Unprocessable Entity.
