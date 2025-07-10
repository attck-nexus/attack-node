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
   - Enhanced multi-step creation wizard with progress tracking
   - Comprehensive program details including priority, tags, vulnerability types, and scope
   - Click-to-inspect program cards with detailed view and edit capabilities
   - Support for program rules, out-of-scope items, and contact information
2. **Vulnerability Tracking**: Comprehensive vulnerability lifecycle management with severity classification
3. **AI-Powered Reporting**: Automated vulnerability report generation using OpenAI
4. **Multi-Agent System**: Support for various AI agents including OpenAI, local agents, and Burp Suite integration
5. **Analytics Dashboard**: Performance metrics and earnings tracking
6. **Docker Integration**: Containerized security tools with web-based interfaces
7. **Burp Suite Professional**: Custom Docker container with user-provided license support
8. **Kali Linux Environment**: Persistent penetration testing environment

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
- **@anthropic-ai/sdk**: Claude integration for enhanced AI capabilities
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

## Docker Integration Architecture

### Supported Integrations
1. **Burp Suite Professional**: Custom Docker containers with two modes:
   - **GUI Mode**: Web-based access via KasmWeb VNC interface on port 6901
   - **Headless Mode**: Runs with Docker volume mapping using `java -jar -Xmx1024m` command
   - Upload burpsuite_pro.jar installer (required)
   - Optional license file integration for automated activation
   - Persistent project storage in both modes

2. **KasmWeb Applications**: Pre-built security tools with web interfaces
   - Maltego: OSINT and forensics analysis
   - Visual Studio Code: Development environment

3. **Kali Linux Environment**: Full penetration testing distribution
   - Persistent storage for tools and data
   - Pre-installed security applications
   - VNC web interface for GUI access
   - Docker container with shared volumes

### Docker Service Features
- Automatic image pulling and container management
- File upload handling for custom installations
- Container lifecycle management (start/stop/status)
- Resource monitoring and cleanup
- Port management for web interfaces

## Agent Loop System Architecture

### Iterative Refinement Mechanism
The platform implements sophisticated agent loops for iterative payload and POC refinement:

1. **Loop Configuration**
   - Enable/disable loop functionality per agent
   - Partner agent selection for collaborative refinement
   - Maximum iteration limits (default: 5)
   - Configurable exit conditions (functional POC, vulnerability confirmed, exploit successful)

2. **Loop Execution Engine**
   - Alternating execution between paired agents
   - Context preservation across iterations
   - Exit condition evaluation after each iteration
   - Real-time progress monitoring and status updates

3. **Agent Communication**
   - Output from one agent becomes input for the next
   - Custom prompts enhance agent specialization
   - Multi-agent workflow orchestration via flow order
   - Seamless integration with OpenAI, Anthropic, and local agents

4. **Loop Management Interface**
   - Visual loop configuration in agent forms
   - Real-time monitoring of active loops
   - Manual loop termination controls
   - Iteration history and result tracking

### Exit Conditions
- **Functional POC**: Loop completes when a working proof of concept is generated
- **Vulnerability Confirmed**: Stops when vulnerability is verified and documented
- **Exploit Successful**: Terminates upon successful exploit development

## Client Certificate Management System

### Certificate Upload and Storage
The platform now supports client certificate management for accessing secure resources:
- **Certificate Upload**: Upload client certificates (.pem/.crt), private keys (.key/.pem), and optional CA certificates
- **Secure Storage**: Encrypted passphrase storage with secure file management
- **Certificate Validation**: Automatic validation of certificate and private key format
- **Domain Mapping**: Associate certificates with specific domains or scopes

### Certificate Management Features
- **Status Tracking**: Monitor certificate expiration dates and active status
- **Download Support**: Download individual certificate components (cert, key, CA)
- **Metadata Management**: Name, description, and domain association
- **Active/Inactive Toggle**: Enable/disable certificates as needed

### API Endpoints
- `GET /api/certificates` - List all certificates
- `POST /api/certificates` - Upload new certificate with files
- `PUT /api/certificates/:id` - Update certificate metadata
- `DELETE /api/certificates/:id` - Delete certificate and associated files
- `GET /api/certificates/:id/download` - Download certificate components

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Added Docker integration with Burp Suite Professional support
- July 06, 2025. Created comprehensive integrations page with KasmWeb applications
- July 06, 2025. Implemented file upload system for custom tool installations
- July 06, 2025. Added Anthropic Claude integration to AI Agents alongside OpenAI
- July 06, 2025. Removed OWASP ZAP, Wireshark, and Metasploit from integrations per user request
- July 06, 2025. Implemented agent loop mechanism with iterative payload refinement system
- July 09, 2025. Added comprehensive client certificate management system with upload/download functionality
- July 10, 2025. Added Anthropic API Key configuration to settings page alongside OpenAI integration
- July 10, 2025. Fixed file upload size limit issues - increased limits to 1GB for large JAR file uploads
- July 10, 2025. Enhanced Docker service with availability checking and graceful error handling
- July 10, 2025. Improved Burp Suite integration UI with better status indicators and error messages
- July 10, 2025. Implemented headless Burp Suite mode with Docker volume mapping using java -jar command
- July 10, 2025. Enhanced Create Project functionality with multi-step wizard, comprehensive fields (priority, tags, vulnerability types, contact info, dates), and detailed program inspection view