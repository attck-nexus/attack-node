# Attack Node Platform

## Overview

Attack Node is a comprehensive Red Team operations platform designed for security professionals. It provides advanced tools for managing offensive security operations, beacon monitoring, network discovery, and leveraging AI agents for automated exploitation and analysis. The platform features integrated security tools like Kali Linux and Burp Suite with remote access capabilities through RustDesk.

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
- **Operations**: Red Team operations and engagements
- **Systems**: Target systems within operations
- **Beacons**: Active command and control beacons
- **Network Discoveries**: Network scanning and discovery results
- **Remote Sessions**: RustDesk and remote access sessions
- **AI Agents**: Automated exploitation and analysis agents
- **Reports**: Generated operation reports

## Key Components

### Core Features
1. **Operation Management**: Track Red Team operations and engagements
   - Enhanced multi-step creation wizard with progress tracking
   - Comprehensive operation details including priority, tags, target systems, and scope
   - Click-to-inspect operation cards with detailed view and edit capabilities
   - Support for operation rules, engagement terms, and contact information
2. **Beacon Tracking**: Comprehensive beacon lifecycle management with protocol monitoring
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
- `/api/operations` - Red Team operation CRUD operations
- `/api/systems` - Target system management
- `/api/beacons` - Beacon tracking and management
- `/api/network-discoveries` - Network discovery results
- `/api/remote-sessions` - Remote access session management
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

## Local Deployment

The project includes comprehensive deployment documentation:
- **DEPLOYMENT_GUIDE.md**: Step-by-step Ubuntu 22.04 deployment instructions
- **.env.example**: Example environment configuration file
- **setup.sh**: Automated setup script for quick installation

Quick start on Ubuntu 22.04:
```bash
chmod +x setup.sh
./setup.sh
npm run dev
```

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 10, 2025. Rebranded from "BugBounty Command" to "Attack Node" with new futuristic red network aesthetic
- July 10, 2025. Updated color scheme to match dark teal/cyan background with red accents inspired by network node visualization
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
- July 10, 2025. Added Markdown rendering support for Program Rules & Policies and Description fields using react-markdown with proper dark theme styling
- July 10, 2025. Fixed Docker container VNC access by updating all window.open calls to use Replit proxy URLs (/proxy/[port]/) instead of localhost - affects Kali environment, Burp Suite, and all integrations
- July 10, 2025. Implemented global configuration persistence with database storage for settings, API keys, and user preferences
- July 10, 2025. Fixed notification bell icon by adding interactive dropdown menu with sample notifications and mark-as-read functionality
- July 10, 2025. Fixed File Manager authentication errors in development mode by properly handling mock user authentication when Google OAuth is not configured
- July 10, 2025. Created comprehensive local deployment guide with automated setup script for Ubuntu 22.04, including PostgreSQL setup, environment configuration, and optional Docker installation