# BugBounty Command Platform

## Overview

BugBounty Command is a multi-agent security platform designed for bug bounty hunters and security researchers. It provides a comprehensive suite of tools for managing bug bounty programs, tracking vulnerabilities, and leveraging AI agents for automated security testing and report generation.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom dark theme
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe queries
- **File Upload**: Multer for handling file attachments
- **Session Management**: connect-pg-simple for PostgreSQL session store

### Database Schema
The application uses a relational database with the following core entities:
- **Users**: Authentication and user management
- **Programs**: Bug bounty programs from various platforms
- **Targets**: Specific URLs/assets within programs
- **Vulnerabilities**: Discovered security issues with detailed tracking
- **AI Agents**: Automated security testing agents
- **Reports**: Generated vulnerability reports

## Key Components

### Core Features
1. **Program Management**: Track bug bounty programs from HackerOne, Bugcrowd, and other platforms
2. **Vulnerability Tracking**: Comprehensive vulnerability lifecycle management with severity classification
3. **AI-Powered Reporting**: Automated vulnerability report generation using OpenAI
4. **Multi-Agent System**: Support for various AI agents including OpenAI, local agents, and Burp Suite integration
5. **Analytics Dashboard**: Performance metrics and earnings tracking

### UI Components
- **Sidebar Navigation**: Fixed sidebar with program categories and integrations
- **Dashboard**: Real-time statistics and recent activity overview
- **Program Cards**: Visual representation of bug bounty programs with status indicators
- **Vulnerability Cards**: Detailed vulnerability tracking with severity color coding
- **AI Agent Status**: Real-time monitoring of automated agents

### API Structure
RESTful API endpoints organized by resource:
- `/api/programs` - Program CRUD operations
- `/api/targets` - Target management
- `/api/vulnerabilities` - Vulnerability tracking
- `/api/ai-agents` - AI agent management
- `/api/reports` - Report generation and retrieval

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to Express API endpoints
2. Server validates requests using Zod schemas
3. Database operations performed through Drizzle ORM
4. Responses formatted and returned to client
5. TanStack Query manages caching and synchronization

### File Upload Process
1. Files uploaded through Multer middleware
2. Stored in local uploads directory with size limits
3. File metadata tracked in database
4. Associated with vulnerability reports

### AI Integration
1. OpenAI API integration for report generation
2. Configurable AI agents with different capabilities
3. Automated vulnerability analysis and documentation
4. Integration points for external security tools

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework

### AI and Security Tools
- **openai**: GPT-4 integration for report generation
- **multer**: File upload handling
- **express-session**: Session management

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety
- **drizzle-kit**: Database migrations
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation
- Database migrations through Drizzle Kit
- Environment variable configuration for API keys

### Production Build
- Vite builds optimized frontend bundle
- esbuild bundles server code for Node.js
- Static assets served from dist/public
- Database connection through environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: AI service authentication
- `NODE_ENV`: Environment detection
- Session configuration for authentication

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 06, 2025. Initial setup