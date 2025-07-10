
FROM kasmweb/core-ubuntu-focal:1.17.0

USER root

# Install Java
RUN apt-get update && apt-get install -y openjdk-11-jre-headless && rm -rf /var/lib/apt/lists/*

# Create application directory
RUN mkdir -p /opt/burpsuite

# Copy Burp Suite jar
COPY 1752121007354-burpsuite_pro_v2025.5.6.jar /opt/burpsuite/burpsuite.jar



# Set permissions
RUN chown -R kasm-user:kasm-user /opt/burpsuite

USER kasm-user

# Create desktop shortcut
RUN mkdir -p /home/kasm-user/Desktop && \
    echo "[Desktop Entry]" > /home/kasm-user/Desktop/burpsuite.desktop && \
    echo "Type=Application" >> /home/kasm-user/Desktop/burpsuite.desktop && \
    echo "Name=Burp Suite Professional" >> /home/kasm-user/Desktop/burpsuite.desktop && \
    echo "Exec=java -jar /opt/burpsuite/burpsuite.jar " >> /home/kasm-user/Desktop/burpsuite.desktop && \
    echo "Icon=applications-internet" >> /home/kasm-user/Desktop/burpsuite.desktop && \
    echo "Terminal=false" >> /home/kasm-user/Desktop/burpsuite.desktop && \
    chmod +x /home/kasm-user/Desktop/burpsuite.desktop

# Set working directory
WORKDIR /home/kasm-user
