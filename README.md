# Project Overview: Azure Local Release Information Portal

**Last Updated:** May 30, 2025

## 1. Project Goal

To create a reliable, fast, and easy-to-use static website hosted on Cloudflare Pages that provides users with up-to-date release information for Azure Local. The site will feature a user-friendly landing page, a comprehensive backend API for programmatic access (based on the provided OpenAPI specification), and robust caching and failback mechanisms.

## 2. Core Technologies

* **Hosting & Frontend:** Cloudflare Pages (for the static site and Swagger UI)
* **Backend API:** Cloudflare Functions (serverless)
* **Caching:** Cloudflare KV
* **Version Control:** GitHub
* **CI/CD & Automation:** GitHub Actions
* **API Definition & Documentation:** OpenAPI 3.1.0 (base specification provided), Swagger UI

## 3. Key Features & Functionality

### 3.1. Static Website & Landing Page

* Hosted on Cloudflare Pages.
* The main landing page (`/`) will display a clear overview of current Azure Local releases.
* Information displayed will include:
    * Release versions
    * Support status (e.g., supported, end-of-support date)
    * Direct links to relevant Microsoft documentation pages (e.g., release notes, known issues, security updates).
* This data will be fetched dynamically from our backend Cloudflare Functions API.

### 3.2. Backend API (Cloudflare Functions)

* A serverless API built using Cloudflare Functions, based on the provided OpenAPI specification.
* Will serve as the data source for both the frontend landing page and external programmatic consumers.
* The primary external sources for release information are:
    * Main release information: `https://learn.microsoft.com/en-us/azure/azure-local/release-information-23h2`
    * Solution update details: `https://raw.githubusercontent.com/MicrosoftDocs/azure-stack-docs/refs/heads/main/azure-local/update/import-discover-updates-offline-23h2.md`
* **Caching:**
    * All calls to these external resources made by the API will be cached using Cloudflare KV to ensure speed and reduce load on external services.
    * Cache will have appropriate TTLs.
* **Failback Mechanism:**
    * If a KV cache miss occurs and the live external resource is unavailable, the API will attempt to serve data from a statically scraped copy (see Section 3.4).

### 3.3. API Definition & Documentation (OpenAPI & Swagger UI)

* The API will be designed based on the provided OpenAPI 3.1.0 specification (see Appendix A for the base spec). This spec outlines initial endpoints, request parameters, and basic response structures.
* A Swagger UI interface will be available (e.g., at `/api` or `/api-docs`), generated from this OpenAPI specification.
* This will provide interactive documentation for the backend API, allowing users (including those using PowerShell scripts or other programmatic tools) to understand and consume the API effectively.

### 3.4. Code Hosting & CI/CD (GitHub & GitHub Actions)

* The entire codebase (frontend, API functions, OpenAPI spec) will be hosted on GitHub.
* A GitHub Actions pipeline will be configured for:
    * Automated deployment of the static site and Cloudflare Functions to Cloudflare Pages upon commits/merges to the main branch.
    * **Build-time Scraping for Failback:** During the build process, the pipeline will scrape the content from:
        * `https://learn.microsoft.com/en-us/azure/azure-local/release-information-23h2`
        * `https://raw.githubusercontent.com/MicrosoftDocs/azure-stack-docs/refs/heads/main/azure-local/update/import-discover-updates-offline-23h2.md`
    * The scraped content will be stored as static files within the deployment package. This provides a "last known good" snapshot of the data.

## 4. Project Phases & Deliverables

The project will be approached in distinct phases, each with its own testing and QA cycle.

### Phase 1: Backend API Implementation (Core Functionality)

* **Goal:** Establish the foundational serverless API based on the provided OpenAPI specification.
* **Tasks:**
    * Set up Cloudflare Functions environment within the Cloudflare Pages project.
    * Implement logic to scrape/fetch Azure Local release information from the primary external sources:
        * Main release data: `https://learn.microsoft.com/en-us/azure/azure-local/release-information-23h2`
        * NOTE: For parsing the HTML content fetched from external Microsoft documentation pages, it is highly recommended to use a server-side HTML parsing library like cheerio within the Cloudflare Functions. This will provide more robust and maintainable parsing logic compared to relying solely on regular expressions.
        * Solution update details: `https://raw.githubusercontent.com/MicrosoftDocs/azure-stack-docs/refs/heads/main/azure-local/update/import-discover-updates-offline-23h2.md`
    * Implement Cloudflare KV caching for all external calls.
    * Create the initial API endpoints as defined in the base OpenAPI specification (Appendix A). Key endpoints and their intended functionality include:
        * **`GET /api/releases`**:
            * Returns a comprehensive list of all known Azure Local releases.
            * Must support filtering based on query parameters such as `supported`, `releaseTrain`, `baselineRelease`, `buildType`, `version`, `osBuild`, `newDeployments`, `solutionUpdate`, and `latest` as outlined in the OpenAPI spec.
        * **`GET /api/releasetrains`**:
            * Returns a simplified list of unique available release train versions.
            * Must support filtering based on query parameters such as `supported`, `releaseTrain`, and `latest` as outlined in the OpenAPI spec.
    * The structure of individual items within the responses should align with the example JSON provided (see Appendix B).
* **Testing:** Unit tests for parsing logic and filtering. Integration tests for API endpoints (mocking KV and external fetches), including tests for various parameter combinations.

### Phase 2: API Documentation (Swagger UI)

* **Goal:** Provide clear, interactive documentation for the API.
* **Tasks:**
    * Refine and maintain the OpenAPI (v3.x) specification (starting with the base provided in Appendix A) to accurately reflect the implemented API, including detailed request and response schemas (leveraging the example structures from Appendix B for response bodies).
    * Integrate Swagger UI into the Cloudflare Pages site, making it accessible (e.g., via `/api` or a similar path).
    * Ensure Swagger UI correctly renders the API documentation and allows for test calls to the deployed API.
* **Testing:** Verify Swagger UI renders correctly, accurately reflects the API, and interactive "try it out" features function as expected.

### Phase 3: Frontend Landing Page

* **Goal:** Create a user-friendly interface for Browse release information.
* **Tasks:**
    * Develop a single-page application (SPA) or static HTML page(s) for the site's root (`/`).
    * The page will consume the `/api/releases` endpoint (potentially with default filters, e.g., latest supported releases) to display:
        * A sortable/filterable list/table of releases.
        * Key information: version, availability date, support status (visually indicated), links to docs.
    * Consider providing UI elements (dropdowns, checkboxes) for users to apply common filters supported by the API.
    * Ensure the design is clean, responsive, and easy to navigate.
* **Testing:** UI/UX testing, cross-browser compatibility, accessibility checks, frontend interaction with the API.

### Phase 4: Enhanced Resilience (GitHub Actions Scraping & API Failback)

* **Goal:** Improve the API's resilience against external site outages.
* **Tasks:**
    * Configure the GitHub Actions pipeline (from Section 3.4) to:
        * During the build process, execute scripts that scrape the primary external Azure Local release information pages:
            * `https://learn.microsoft.com/en-us/azure/azure-local/release-information-23h2`
            * `https://raw.githubusercontent.com/MicrosoftDocs/azure-stack-docs/refs/heads/main/azure-local/update/import-discover-updates-offline-23h2.md`
        * Store this scraped data as static JSON (or other suitable format) files within the project, which will be deployed with the site to Cloudflare Pages.
    * Update the Cloudflare Functions API logic:
        * If a request is made, and
            1.  The Cloudflare KV cache for the external resource is empty/stale, AND
            2.  A live fetch to the external resource fails (e.g., timeout, HTTP error),
        * Then, the API should attempt to load and return data from the statically scraped files deployed with the application, applying any request filtering parameters to this static dataset if feasible.
* **Testing:** Test failback scenarios by mocking KV misses and external API failures. Ensure the GitHub Action correctly scrapes and stores data. Verify filtering on failback data.

## 5. General Requirements

* **Testing:** Comprehensive testing (unit, integration, E2E where appropriate) should be part of each phase.
* **QA:** A proper QA process should be followed before marking any phase as complete.
* **Code Quality:** Code should be well-documented, maintainable, and follow best practices.
* **Security:** Consider security best practices, especially for the API and any data handling.

---

## Appendix A: Base OpenAPI 3.1.0 Specification

```json
{
  "openapi": "3.1.0",
  "jsonSchemaDialect": "[https://spec.openapis.org/oas/3.1/dialect/base](https://spec.openapis.org/oas/3.1/dialect/base)",
  "info": {
    "license": {
      "name": "MIT"
    },
    "title": "Azure Local Releases - OpenAPI",
    "version": "1.0.0",
    "description": "API to retrieve information about Azure Local Releases",
    "contact": {
      "name": "erikgraa",
      "url": "[https://github.com/erikgraa](https://github.com/erikgraa)"
    }
  },
  "tags": [
    {
      "name": "Releases",
      "description": "Azure Local Releases"
    },
    {
      "name": "ReleaseTrains",
      "description": "Azure Local Release Trains"
    }
  ],
  "paths": {
    "/api/releases": {
      "get": {
        "tags": [
          "Releases"
        ],
        "summary": "Retrieve Azure Local Releases",
        "parameters": [
          {
            "description": "Support status",
            "name": "supported",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          },
          {
            "description": "A release train, e.g. 2408 or 2411",
            "name": "releaseTrain",
            "schema": {
              "type": "string"
            },
            "in": "query"
          },
          {
            "description": "A baseline releases can be used for new deployments",
            "name": "baselineRelease",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          },
          {
            "description": "A Feature build is the first release in a release train, whereas Cumulative builds are subsequent releases in a release train",
            "name": "buildType",
            "schema": {
              "enum": ["Feature", "Cumulative"],
              "type": "string"
            },
            "in": "query"
          },
          {
            "description": "Full version, e.g. 10.2411.3.2",
            "name": "version",
            "schema": {
              "type": "string"
            },
            "in": "query"
          },
          {
            "description": "OS Build",
            "name": "osBuild",
            "schema": {
              "type": "string"
            },
            "in": "query"
          },
          {
            "description": "Retrieve only releases to be used in new deployments",
            "name": "newDeployments",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          },
          {
            "description": "Retrieve only releases with downloadable solution update ZIP (true means a solutionUpdate object exists and is not empty, false means it doesn't exist or is empty)",
            "name": "solutionUpdate",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          },
          {
            "description": "Retrieve only the latest release (overall, or per releaseTrain if specified)",
            "name": "latest",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          }
        ],
        "responses": {
          "200": {
            "description": "OK" 
            // Developer Note: Response schema to be detailed here, based on Appendix B structure.
          },
          "default": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/api/releasetrains": {
      "get": {
        "tags": [
          "ReleaseTrains"
        ],
        "summary": "Retrieve Azure Local Release Trains",
        "parameters": [
          {
            "description": "Support status",
            "name": "supported",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          },
          {
            "description": "A release train, e.g. 2408 or 2411",
            "name": "releaseTrain",
            "schema": {
              "type": "string"
            },
            "in": "query"
          },
          {
            "description": "Retrieve only the latest release train (overall)",
            "name": "latest",
            "schema": {
              "type": "boolean"
            },
            "in": "query"
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
            // Developer Note: Response schema to be detailed here, based on Appendix B structure.
          },
          "default": {
            "description": "Internal server error"
          }
        }
      }
    }
  },
  "components": {
    // Developer Note: Schemas for Release and ReleaseTrain objects (from Appendix B) should be defined here and referenced in the 200 responses.
  }
}
```

---

## Appendix B: Example API Response Data Structures

* **`GET /api/releases` item structure (within the `releases` array):**
    ```json
    {
      "version": "12.2504.1001.20",
      "availabilityDate": "2025-04-29",
      "newDeployments": true,
      "osBuild": "26100.3775",
      "releaseTrain": "2504",
      "release": "2504.1001.20",
      "releaseShortened": "2504.1001",
      "baselineRelease": true,
      "buildType": "Feature",
      "endOfSupportDate": "2025-10-26",
      "supported": true,
      "solutionUpdate": {}, // or {"uri": "...", "fileHash": "..."}
      "urls": {
        "security": "[https://learn.microsoft.com/en-us/azure/azure-local/security-update/security-update?view=azloc-2504&preserve-view=true&tabs=new-deployments](https://learn.microsoft.com/en-us/azure/azure-local/security-update/security-update?view=azloc-2504&preserve-view=true&tabs=new-deployments)",
        "news": "[https://learn.microsoft.com/en-us/azure/azure-local/whats-new?view=azloc-2504&preserve-view=true#features-and-improvements-in-2504](https://learn.microsoft.com/en-us/azure/azure-local/whats-new?view=azloc-2504&preserve-view=true#features-and-improvements-in-2504)",
        "issues": "[https://learn.microsoft.com/en-us/azure/azure-local/known-issues?view=azloc-2504&preserve-view=true](https://learn.microsoft.com/en-us/azure/azure-local/known-issues?view=azloc-2504&preserve-view=true)"
      }
    }
    ```
    *(The full response for `/api/releases` will be an object like `{"releases": [ ... ]}`)*

* **`GET /api/releasetrains` item structure (within the `releaseTrains` array):**
    ```json
    {
      "supported": true,
      "releaseTrain": "2505"
    }
    ```
    *(The full response for `/api/releasetrains` will be an object like `{"releaseTrains": [ ... ]}`)*
