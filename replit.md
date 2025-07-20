# Code Converter Application

## Overview

This is a locally-runnable full-stack code conversion platform for transforming test automation code to Robot Framework on Windows machines. The application converts test automation code from various frameworks (like Java/Selenium) to Robot Framework using AI-powered analysis. It provides a user-friendly portal for GitHub repository integration, code analysis, and automated conversion with deployment capabilities.

**Windows Compatibility**: This application is specifically designed to work on Windows machines with cross-platform file handling, proper path management, and Windows-compatible Git operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Pattern**: RESTful endpoints with JSON communication
- **File Processing**: Server-side repository cloning and file manipulation
- **Error Handling**: Centralized error middleware

### Database Strategy
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared schema definitions between client and server
- **Storage**: Currently using in-memory storage (MemStorage) with interface for future database integration
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Repository Integration
- **GitHub Service**: Handles repository validation, cloning, and pushing using GitPython
- **Authentication**: Support for both public repositories and private repositories with access tokens
- **File Analysis**: Repository structure detection and test file identification

### AI-Powered Conversion
- **OpenAI Integration**: Uses Azure OpenAI GPT-4o for code analysis and conversion
- **Analysis Engine**: Parses existing test automation code to understand patterns and structure
- **Conversion Engine**: Transforms source code to Robot Framework with Browser Library

### User Interface Flow
1. **Repository Connection**: URL validation and GitHub integration
2. **Tech Stack Configuration**: Source and target framework selection
3. **Conversion Progress**: Real-time status updates and logging
4. **Review & Deploy**: File preview and deployment options

### File Processing
- **Archive Generation**: Creates downloadable ZIP files of converted code
- **File Preview**: In-browser code review capabilities
- **Deployment**: Direct push to GitHub repositories

## Data Flow

1. **Input**: User provides GitHub repository URL and configuration
2. **Validation**: Repository accessibility and structure analysis
3. **Cloning**: Server-side repository download to temporary directory
4. **Analysis**: AI-powered code understanding and pattern recognition
5. **Conversion**: Transformation to Robot Framework syntax
6. **Output**: Generated files available for review, download, or deployment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity (prepared for PostgreSQL)
- **@tanstack/react-query**: Client-side data fetching and caching
- **@radix-ui/**: UI component primitives for accessibility
- **drizzle-orm**: Type-safe database operations
- **archiver**: ZIP file generation for downloads

### AI and Processing
- **OpenAI**: AI-powered code analysis and conversion
- **GitPython**: Repository operations (cloning, pushing)
- **connect-pg-simple**: Session storage for PostgreSQL

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **vite**: Development server and build tool

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **API Server**: Express server with TypeScript compilation
- **Database**: In-memory storage during development

### Production
- **Build Process**: Vite builds client assets, esbuild bundles server
- **Server**: Node.js with compiled TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but not yet implemented)
- **Environment**: Environment variables for database URL and API keys

### Configuration
- **Database**: Configured for PostgreSQL via `DATABASE_URL` environment variable
- **Deployment**: Prepared for containerized deployment with separate client/server builds
- **Session Management**: Ready for persistent session storage with PostgreSQL

The application is architected for scalability with clear separation between frontend and backend, prepared database integration, and modular service design for easy maintenance and feature expansion.