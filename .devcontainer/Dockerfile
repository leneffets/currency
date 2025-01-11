FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Install lighttpd
RUN apt-get update && apt-get install -y lighttpd

# Copy lighttpd configuration file
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

# Expose port 80
EXPOSE 3000
