# QuickBite Java Backend

This is the Java Spring Boot version of the QuickBite backend, converted from the original Node.js/Express implementation.

## Prerequisites

-   Java 17 or higher
-   Maven
-   MongoDB (running locally or cloud)

## Configuration

1.  Open `src/main/resources/application.properties`.
2.  Set the following environment variables or update the file directly:
    -   `MONGODB_URI`: Your MongoDB connection string.
    -   `EMAIL_USER`: Your email for sending OTPs.
    -   `EMAIL_PASS`: Your email app password.
    -   `JWT_SECRET`: Secret key for JWT signing.

## Running the Application

To run the application:

```bash
mvn spring-boot:run
```

The server will start on port **5000** (matching the original Node.js port).

## API Endpoints

-   **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
-   **OTP**: `/api/otp/send-otp`, `/api/otp/verify-otp`
-   **Menu**: `/api/menu`, `/api/menu/{id}`
-   **Orders**: `/api/orders`, `/api/orders/my-orders`
-   **Health**: `/api/health`

## Structure

-   `com.quickbite.backend.config`: Security & App Config
-   `com.quickbite.backend.controller`: API Endpoints
-   `com.quickbite.backend.model`: Domain Objects (User, MenuItem, Order)
-   `com.quickbite.backend.repository`: Data Access Layer
-   `com.quickbite.backend.security`: JWT & Auth implementations
-   `com.quickbite.backend.service`: Business Logic
