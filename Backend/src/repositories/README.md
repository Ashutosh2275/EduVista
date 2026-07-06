# Repository Layer

The repository layer isolates database operations from business logic. All database querying, creation, updating, and indexing operations are performed here via Mongoose Models.

## Guidelines
- Write one repository class per entity (e.g., `UserRepository.ts`, `CollegeRepository.ts`).
- Avoid running raw Mongoose queries directly in controllers or services; delegate to repositories.
- Perform pagination, filtering, and sorting preparation here or in a specialized QueryHelper.
