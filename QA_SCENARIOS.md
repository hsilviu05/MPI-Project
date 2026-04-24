# QA Scenarios

These scenarios are defined before implementation so development can be validated against clear expectations.

## 1. Authentication

### 1.1 User registration - valid flow
- Given a new user provides a valid email, username, and password
- When the frontend sends a registration request to `/auth/register`
- Then the backend returns `201 Created`
- And the response contains a user identifier and success message
- And the user can log in with the same credentials

### 1.2 User registration - invalid email
- Given a user provides an invalid email format
- When the frontend sends a registration request
- Then the backend returns `422 Unprocessable Entity`
- And the response includes a validation error about email format

### 1.3 User registration - missing required fields
- Given a user omits the username or password field
- When the frontend sends a registration request
- Then the backend returns `422 Unprocessable Entity`
- And the response includes a validation error for the missing fields

### 1.4 Login - valid credentials
- Given a registered user provides correct email and password
- When the frontend sends a login request to `/auth/login`
- Then the backend returns `200 OK`
- And the response includes an access token
- And the token can be used to authenticate subsequent requests

### 1.5 Login - invalid credentials
- Given a registered user provides an incorrect password
- When the frontend sends a login request
- Then the backend returns `401 Unauthorized`
- And the response contains an authentication failure message

### 1.6 Access protected resource without token
- Given no authentication token is provided
- When the frontend requests a protected endpoint
- Then the backend returns `401 Unauthorized`
- And the response contains an authentication error

## 2. Portfolio Management

### 2.1 Create portfolio - valid flow
- Given an authenticated user provides a valid portfolio name and optional description
- When the frontend sends a request to `/portfolios/`
- Then the backend returns `201 Created`
- And the portfolio is associated with the authenticated user
- And the response includes the new portfolio details

### 2.2 Create portfolio - name missing
- Given an authenticated user submits a portfolio create request without a name
- When the backend validates the request
- Then the backend returns `422 Unprocessable Entity`
- And the response includes a validation error for missing portfolio name

### 2.3 Create portfolio - name exceeds max length
- Given an authenticated user submits a portfolio name that exceeds length limits
- When the backend validates the request
- Then the backend returns `422 Unprocessable Entity`
- And the response includes a validation error for name length

### 2.4 List portfolios - valid flow
- Given an authenticated user has one or more portfolios
- When the frontend requests `/portfolios/`
- Then the backend returns `200 OK`
- And the response includes a list of that user’s portfolios

### 2.5 Get portfolio by ID - valid flow
- Given an authenticated user requests an existing portfolio ID they own
- When the frontend calls `/portfolios/{portfolio_id}`
- Then the backend returns `200 OK`
- And the response includes the portfolio details

### 2.6 Get portfolio by ID - unauthorized access
- Given an authenticated user requests a portfolio owned by another user
- When the frontend calls `/portfolios/{portfolio_id}`
- Then the backend returns `403 Forbidden`
- And the response includes an authorization error

## 3. Holdings Management

### 3.1 Add holding - valid flow
- Given an authenticated user adds a valid holding symbol and quantity to an owned portfolio
- When the frontend sends a request to `/holdings/`
- Then the backend returns `201 Created`
- And the holding is associated with the portfolio
- And the response includes holding details

### 3.2 Add holding - invalid symbol
- Given the user adds a holding with an invalid or unsupported asset symbol
- When the backend validates the asset symbol
- Then the backend returns `422 Unprocessable Entity`
- And the response includes an invalid symbol error

### 3.3 Add holding - negative quantity
- Given the user submits a holding quantity that is zero or negative
- When the backend validates the request
- Then the backend returns `422 Unprocessable Entity`
- And the response includes a validation error about holding quantity

### 3.4 List holdings - valid flow
- Given a portfolio contains holdings
- When the frontend requests `/holdings/?portfolio_id={id}`
- Then the backend returns `200 OK`
- And the response includes holdings for that portfolio only

### 3.5 Remove holding - valid flow
- Given an authenticated user deletes a holding from their portfolio
- When the frontend sends a delete request for that holding
- Then the backend returns `204 No Content`
- And the holding is removed from the portfolio

## 4. Price and Valuation

### 4.1 Get latest asset price - valid symbol
- Given a valid asset symbol exists in the price provider
- When the backend requests the latest price
- Then the service returns `200 OK`
- And the response includes the asset’s current price

### 4.2 Get latest asset price - unknown symbol
- Given an invalid or unknown asset symbol
- When the backend requests the latest price
- Then the service returns an error
- And the response clarifies the symbol was not found

### 4.3 Portfolio valuation - valid flow
- Given a portfolio has holdings with valid symbols
- When the frontend requests `/portfolios/{id}/valuation`
- Then the backend returns `200 OK`
- And the response includes current valuation and aggregate metrics

### 4.4 Portfolio valuation - missing prices
- Given a portfolio contains holdings for which price data is unavailable
- When the backend attempts valuation
- Then the endpoint returns `422 Unprocessable Entity` or `404 Not Found`
- And the response explains which asset prices are missing

## 5. Frontend/UX Scenarios

### 5.1 Login flow - happy path
- Given a user navigates to the login page
- When the user enters valid credentials and submits
- Then the app navigates to the dashboard
- And the user sees portfolio summaries

### 5.2 Registration flow - invalid inputs
- Given a user fills registration fields with invalid values
- When the user submits the form
- Then the UI shows inline validation errors
- And the form does not submit successfully

### 5.3 Portfolio creation flow - unauthorized
- Given an unauthenticated visitor tries to access portfolio management
- When they attempt to create or view portfolios
- Then the app redirects to login or shows an authentication prompt

## 6. Cross-cutting QA checks

- Ensure all protected API routes require a valid bearer token
- Validate errors are returned consistently with `status_code` and message payloads
- Confirm user data is isolated so one user cannot see another user’s portfolios or holdings
- Verify database state resets between test runs for repeatable results
- Check that input validation rejects malformed JSON and unexpected fields
