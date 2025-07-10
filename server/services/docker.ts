import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  port: number;
  status: 'running' | 'stopped' | 'installing' | 'error';
  created: Date;
  fileUploads?: string[];
}

export class DockerService {
  private containers = new Map<string, DockerContainer>();
  private uploadDir = path.join(process.cwd(), 'uploads', 'docker');
  private dockerAvailable: boolean | null = null;

  constructor() {
    this.ensureUploadDir();
    this.checkDockerAvailability();
  }

  private async checkDockerAvailability(): Promise<boolean> {
    if (this.dockerAvailable !== null) {
      return this.dockerAvailable;
    }

    try {
      await execAsync('docker --version');
      this.dockerAvailable = true;
      return true;
    } catch (error) {
      console.warn('Docker is not available in this environment');
      this.dockerAvailable = false;
      return false;
    }
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async pullImage(image: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(`docker pull ${image}`);
      console.log('Docker pull output:', stdout);
      if (stderr) console.warn('Docker pull warnings:', stderr);
      return true;
    } catch (error) {
      console.error('Failed to pull Docker image:', error);
      return false;
    }
  }

  async startBurpSuite(jarPath?: string, licensePath?: string): Promise<DockerContainer> {
    const containerName = 'bugbounty-burpsuite';
    const port = 6901;

    // Check if Docker is available
    const dockerAvailable = await this.checkDockerAvailability();
    if (!dockerAvailable) {
      throw new Error('Docker is not available in this environment. Please install Docker to use container features.');
    }

    try {
      // Stop existing container if running
      await this.stopContainer(containerName);

      // Build custom Burp Suite image if jar file is provided
      let imageName = 'kasmweb/burpsuite-custom';
      
      if (jarPath) {
        imageName = await this.buildBurpSuiteImage(jarPath, licensePath);
      }

      // Start the container
      const dockerCmd = [
        'docker', 'run', '-d',
        '--name', containerName,
        '--shm-size=512m',
        '-p', `${port}:6901`,
        '-e', 'VNC_PW=password',
        '-v', `${this.uploadDir}:/home/kasm-user/shared`,
        imageName
      ];

      const { stdout } = await execAsync(dockerCmd.join(' '));
      const containerId = stdout.trim();

      const container: DockerContainer = {
        id: containerId,
        name: containerName,
        image: imageName,
        port,
        status: 'running',
        created: new Date(),
        fileUploads: jarPath ? [jarPath, licensePath].filter((f): f is string => Boolean(f)) : []
      };

      this.containers.set(containerName, container);
      return container;
    } catch (error) {
      console.error('Failed to start Burp Suite container:', error);
      throw new Error('Failed to start Burp Suite container');
    }
  }

  async startKasmWebApp(appName: string, image: string, port: number): Promise<DockerContainer> {
    const containerName = `bugbounty-${appName}`;

    // Check if Docker is available
    const dockerAvailable = await this.checkDockerAvailability();
    if (!dockerAvailable) {
      throw new Error('Docker is not available in this environment. Please install Docker to use container features.');
    }

    try {
      // Stop existing container if running
      await this.stopContainer(containerName);

      // Pull the image first
      await this.pullImage(image);

      // Start the container
      const dockerCmd = [
        'docker', 'run', '-d',
        '--name', containerName,
        '--shm-size=512m',
        '-p', `${port}:6901`,
        '-e', 'VNC_PW=password',
        '-v', `${this.uploadDir}:/home/kasm-user/shared`,
        image
      ];

      const { stdout } = await execAsync(dockerCmd.join(' '));
      const containerId = stdout.trim();

      const container: DockerContainer = {
        id: containerId,
        name: containerName,
        image,
        port,
        status: 'running',
        created: new Date()
      };

      this.containers.set(containerName, container);
      return container;
    } catch (error) {
      console.error(`Failed to start ${appName} container:`, error);
      throw new Error(`Failed to start ${appName} container`);
    }
  }

  async stopContainer(nameOrId: string): Promise<boolean> {
    try {
      // Try to stop the container
      await execAsync(`docker stop ${nameOrId}`);
      // Remove the container
      await execAsync(`docker rm ${nameOrId}`);
      
      // Update our local state
      const entries = Array.from(this.containers.entries());
      for (const [key, container] of entries) {
        if (container.name === nameOrId || container.id === nameOrId) {
          container.status = 'stopped';
          this.containers.delete(key);
          break;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to stop container:', error);
      return false;
    }
  }

  async getContainerStatus(nameOrId: string): Promise<'running' | 'stopped' | 'error'> {
    try {
      const { stdout } = await execAsync(`docker ps -q -f name=${nameOrId}`);
      return stdout.trim() ? 'running' : 'stopped';
    } catch (error) {
      console.error('Failed to get container status:', error);
      return 'error';
    }
  }

  async listContainers(): Promise<DockerContainer[]> {
    const dockerAvailable = await this.checkDockerAvailability();
    if (!dockerAvailable) {
      return [];
    }
    
    try {
      // Update status for all tracked containers
      const entries = Array.from(this.containers.entries());
      for (const [key, container] of entries) {
        container.status = await this.getContainerStatus(container.name);
      }
      
      return Array.from(this.containers.values());
    } catch (error) {
      console.error('Failed to list containers:', error);
      return [];
    }
  }

  private async buildBurpSuiteImage(jarPath: string, licensePath?: string): Promise<string> {
    const buildDir = path.join(this.uploadDir, 'burpsuite-build');
    const imageName = 'kasmweb/burpsuite-custom:latest';

    try {
      // Create build directory
      await fs.mkdir(buildDir, { recursive: true });

      // Copy jar file to build directory
      const jarFileName = path.basename(jarPath);
      await fs.copyFile(jarPath, path.join(buildDir, jarFileName));

      // Copy license file if provided
      let licenseFileName = '';
      if (licensePath) {
        licenseFileName = path.basename(licensePath);
        await fs.copyFile(licensePath, path.join(buildDir, licenseFileName));
      }

      // Create Dockerfile
      const dockerfile = `
FROM kasmweb/core-ubuntu-focal:1.17.0

USER root

# Install Java
RUN apt-get update && apt-get install -y openjdk-11-jre-headless && rm -rf /var/lib/apt/lists/*

# Create application directory
RUN mkdir -p /opt/burpsuite

# Copy Burp Suite jar
COPY ${jarFileName} /opt/burpsuite/burpsuite.jar

${licensePath ? `# Copy license file\nCOPY ${licenseFileName} /opt/burpsuite/license.txt` : ''}

# Set permissions
RUN chown -R kasm-user:kasm-user /opt/burpsuite

USER kasm-user

# Create desktop shortcut
RUN mkdir -p /home/kasm-user/Desktop && \\
    echo "[Desktop Entry]" > /home/kasm-user/Desktop/burpsuite.desktop && \\
    echo "Type=Application" >> /home/kasm-user/Desktop/burpsuite.desktop && \\
    echo "Name=Burp Suite Professional" >> /home/kasm-user/Desktop/burpsuite.desktop && \\
    echo "Exec=java -jar /opt/burpsuite/burpsuite.jar ${licensePath ? '--config-file=/opt/burpsuite/license.txt' : ''}" >> /home/kasm-user/Desktop/burpsuite.desktop && \\
    echo "Icon=applications-internet" >> /home/kasm-user/Desktop/burpsuite.desktop && \\
    echo "Terminal=false" >> /home/kasm-user/Desktop/burpsuite.desktop && \\
    chmod +x /home/kasm-user/Desktop/burpsuite.desktop

# Set working directory
WORKDIR /home/kasm-user
`;

      await fs.writeFile(path.join(buildDir, 'Dockerfile'), dockerfile);

      // Build the Docker image
      const buildCmd = `docker build -t ${imageName} ${buildDir}`;
      const { stdout, stderr } = await execAsync(buildCmd);
      
      console.log('Docker build output:', stdout);
      if (stderr) console.warn('Docker build warnings:', stderr);

      return imageName;
    } catch (error) {
      console.error('Failed to build Burp Suite image:', error);
      throw new Error('Failed to build custom Burp Suite image');
    }
  }

  async saveUploadedFile(fileBuffer: Buffer, originalName: string): Promise<string> {
    const fileName = `${Date.now()}-${originalName}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    await fs.writeFile(filePath, fileBuffer);
    return filePath;
  }

  async getDockerInfo(): Promise<any> {
    try {
      const { stdout } = await execAsync('docker version --format "{{.Server.Version}}"');
      const version = stdout.trim();
      
      const { stdout: psOutput } = await execAsync('docker ps --format "table {{.Names}}\t{{.Status}}"');
      const runningContainers = psOutput.split('\n').length - 2; // Subtract header and empty line
      
      return {
        version,
        runningContainers: Math.max(0, runningContainers),
        totalImages: this.containers.size
      };
    } catch (error) {
      console.error('Failed to get Docker info:', error);
      return {
        version: 'Unknown',
        runningContainers: 0,
        totalImages: 0
      };
    }
  }

  async cleanupUnusedImages(): Promise<boolean> {
    try {
      await execAsync('docker image prune -f');
      return true;
    } catch (error) {
      console.error('Failed to cleanup unused images:', error);
      return false;
    }
  }

  async stopAllContainers(): Promise<boolean> {
    try {
      const containerNames = Array.from(this.containers.keys());
      for (const name of containerNames) {
        await this.stopContainer(name);
      }
      return true;
    } catch (error) {
      console.error('Failed to stop all containers:', error);
      return false;
    }
  }
}

export const dockerService = new DockerService();