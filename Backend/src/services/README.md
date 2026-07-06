# Service Layer

The service layer contains the core business rules and orchestration logic of the application. It coordinates transactions, handles external API communications (like Cloudinary, SMTP, payment gateways), and interacts with the repository layer.

## Guidelines
- Write thin controllers and thick service classes.
- Controllers should only parse HTTP input and call a service, returning its results through `ApiResponse`.
- All password hashing verification, token generation logic, and email sending reside in services.
