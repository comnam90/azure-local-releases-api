# Changelog

All notable changes to the Azure Local Releases API project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-30

### 🎉 Initial Release
Complete serverless REST API for Azure Local release information with comprehensive data coverage and advanced filtering capabilities.

### ✨ Added
#### Core API Features
- **RESTful API Endpoints**: `/api/releases` and `/api/releasetrains` with full CRUD operations
- **Advanced Filtering System**: Support for multiple query parameters (supported, releaseTrain, newDeployments, buildType)
- **Pagination Support**: Limit/offset pagination for large datasets
- **CORS Support**: Cross-origin requests enabled for web applications
- **JSON Response Format**: Structured, consistent API responses with proper HTTP status codes

#### Data Processing & Parsing
- **Complete Release Coverage**: Parsing of all 26 Azure Local releases from Microsoft documentation
- **Older Versions Table Support**: Comprehensive parsing of "Older versions of Azure Local" table
- **Tab Panel Detection**: HTML-based detection of new vs existing deployment compatibility
- **Solution Updates Integration**: Download links and file hashes from GitHub markdown sources
- **URL Normalization**: Automatic conversion of relative URLs to absolute Microsoft Learn URLs

#### Business Logic & Features
- **Dynamic Support Status**: Real-time 180-day support window calculation from availability dates
- **Release Train Grouping**: Automatic grouping and classification of releases by train (2311-2505)
- **Build Type Classification**: Intelligent Feature vs Cumulative build type detection
- **OS Version Detection**: Support for multiple OS versions per release train (10.x, 11.x, 12.x)
- **Baseline Release Detection**: Automatic identification of baseline releases

#### Performance & Reliability
- **Intelligent Caching**: Cloudflare KV storage with configurable TTL (1-6 hours)
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Data Validation**: Robust validation of parsed data with type safety
- **Response Optimization**: Gzip compression and minimal payload sizes

#### Development & Quality
- **TypeScript Implementation**: Full type safety with strict mode compliance
- **Comprehensive Testing**: 26 tests across 6 test suites with 100% critical path coverage
- **Automated Build System**: TypeScript to JavaScript compilation with source maps
- **Code Quality Tools**: ESLint, Prettier, and Git hooks for consistent code style

### 🏗 Technical Infrastructure
- **Serverless Architecture**: Cloudflare Pages Functions with global edge deployment
- **Modern Runtime**: TypeScript with Cloudflare Workers API
- **External Dependencies**: Cheerio for HTML parsing, minimal dependency footprint
- **Development Tools**: Jest testing framework, Wrangler CLI for deployment

### 📊 Data Coverage
- **26 Total Releases**: Complete historical coverage from 2311 to 2505 release trains
- **8 Release Trains**: 2311, 2402, 2405, 2408, 2411, 2503, 2504, 2505
- **3 Solution Updates**: Download bundles with SHA256 file verification
- **Multiple OS Versions**: Support for 22H2 (10.x), 23H2 (11.x), and 24H2 (12.x)

### 🔧 Key Fixes & Improvements
#### Critical Data Issues Resolved
- **Missing Older Versions**: Fixed parser to include all historical releases from "Older versions of Azure Local" table
- **Support Status Calculation**: Changed from hardcoded dates to dynamic 180-day calculation windows
- **New Deployment Detection**: Replaced version-based logic with HTML tab section parsing
- **Build Type Logic**: Enhanced Feature build identification with OS version + release train grouping

#### Parser Enhancements
- **Multi-table Support**: Parser now handles main release tables + older versions table
- **Tab Section Detection**: Accurate parsing of `#tabpanel_1_existing-deployments` vs `#tabpanel_1_new-deployments`
- **Date Extraction**: Robust regex patterns for availability date parsing
- **URL Processing**: Smart normalization of relative and absolute URLs

### 🚀 Deployment
- **Production URL**: https://phase-1.azure-local-releases-api.pages.dev/
- **Global CDN**: Cloudflare edge locations for optimal performance
- **Environment Configuration**: Production-ready with monitoring and logging
- **Automated Deployment**: CI/CD pipeline with Wrangler deployment

### 📖 Documentation
- **API Documentation**: Complete endpoint documentation with examples
- **Project Summary**: Comprehensive technical overview and architecture guide
- **Usage Examples**: cURL commands and integration examples
- **Type Definitions**: Full TypeScript interfaces for all API responses

### 🧪 Testing & Quality Assurance
- **Unit Tests**: Core functionality and business logic validation
- **Integration Tests**: End-to-end API testing with real data
- **Parser Tests**: HTML and markdown parsing validation
- **Filter Tests**: All query parameter combinations tested
- **Error Handling Tests**: Edge cases and failure scenarios covered

### 🎯 Known Limitations
- **Static Data Source**: Currently relies on scraping Microsoft Learn documentation
- **Solution Updates**: Limited to 3 most recent release trains with GitHub availability
- **Cache Invalidation**: Manual cache refresh required for new Microsoft releases

### 🔮 Future Roadmap
Potential enhancements for future versions:
- **Real-time Updates**: Webhook-based automatic data refresh
- **Additional Endpoints**: Release notes, known issues, and update history
- **Enhanced Filtering**: Date range queries and custom sorting options
- **API Versioning**: Backward compatibility for future schema changes

---

## [Unreleased]
### Planned Improvements
- Automatic cache invalidation based on Microsoft Learn updates
- Enhanced error reporting with detailed validation messages
- Performance optimizations for large-scale queries
- Implement phase 2