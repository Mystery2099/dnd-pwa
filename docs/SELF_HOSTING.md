# Self-Hosting Guide

This guide covers deploying Grimar using Docker/Podman with Cloudflare Tunnel for secure, domain-based access without exposing ports.

## Prerequisites

- Docker or Podman installed
- A Cloudflare account with a domain
- Cloudflare Tunnel set up (via Cloudflare Zero Trust dashboard)

## Quick Start

### 1. Build and Run with Docker

```bash
# Build the image
docker build -t grimar:latest .

# Run the container
docker run -d \
  --name grimar \
  -v grimar-data:/app/data \
  -p 3000:3000 \
  -e DATABASE_URL=/app/data/grimar.db \
  grimar:latest
```

### 2. Using Docker Compose

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f grimar
```

### 3. With Cloudflare Tunnel

```bash
# Start with cloudflared
docker compose --profile tunnel up -d
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `grimar.db` | Path to SQLite database file |
| `PORT` | `3000` | Server port (inside container) |
| `HOST` | `0.0.0.0` | Server host binding |
| `NODE_ENV` | `production` | Environment mode |
| `ORIGIN` | - | Public URL (e.g., `https://dnd.example.com`) |

### Authentication

Grimar uses header-based authentication via reverse proxy (Trust-on-First-Use). Configure your reverse proxy or Cloudflare Access to pass:

- `X-Authentik-Username`: Authenticated username

For Cloudflare Access:
1. Set up Access application in Cloudflare Zero Trust
2. Configure header modification to pass user identity
3. Or use a service like Authentik/Authelia in front

## Docker Compose Examples

### Basic Setup

```yaml
version: "3.8"

services:
  grimar:
    build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - grimar-data:/app/data
    environment:
      - DATABASE_URL=/app/data/grimar.db
      - ORIGIN=https://dnd.example.com
    ports:
      - "3000:3000"

volumes:
  grimar-data:
```

### With Cloudflare Tunnel

```yaml
version: "3.8"

services:
  grimar:
    build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - grimar-data:/app/data
    environment:
      - DATABASE_URL=/app/data/grimar.db
      - ORIGIN=https://dnd.example.com
    networks:
      - internal
    # No exposed ports - accessed via tunnel

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - internal
    depends_on:
      - grimar

networks:
  internal:

volumes:
  grimar-data:
```

### With Traefik Reverse Proxy

```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=admin@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - web

  grimar:
    build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - grimar-data:/app/data
    environment:
      - DATABASE_URL=/app/data/grimar.db
      - ORIGIN=https://dnd.example.com
    networks:
      - web
    labels:
      traefik.enable: true
      traefik.http.routers.grimar.rule: Host(`dnd.example.com`)
      traefik.http.routers.grimar.entrypoints: websecure
      traefik.http.routers.grimar.tls.certresolver: myresolver
      traefik.http.services.grimar.loadbalancer.server.port: 3000

networks:
  web:

volumes:
  grimar-data:
```

### With Traefik + Authentik (Full Auth Stack)

```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=admin@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - web
      - authentik

  grimar:
    build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - grimar-data:/app/data
    environment:
      - DATABASE_URL=/app/data/grimar.db
      - ORIGIN=https://dnd.example.com
    networks:
      - web
      - authentik
    labels:
      traefik.enable: true
      traefik.http.routers.grimar.rule: Host(`dnd.example.com`)
      traefik.http.routers.grimar.entrypoints: websecure
      traefik.http.routers.grimar.tls.certresolver: myresolver
      traefik.http.routers.grimar.middlewares: authentik@docker
      traefik.http.services.grimar.loadbalancer.server.port: 3000

networks:
  web:
  authentik:
    external: true

volumes:
  grimar-data:
```

## Cloudflare Tunnel Setup

### Method 1: Dashboard (Recommended)

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Navigate to **Networks** > **Tunnels**
3. Click **Create a tunnel**
4. Choose **Cloudflared** connector
5. Name your tunnel (e.g., `grimar-tunnel`)
6. Copy the tunnel token
7. Add to your `.env` file:
   ```
   CLOUDFLARE_TUNNEL_TOKEN=your_token_here
   ```
8. Configure public hostname:
   - Subdomain: `dnd` (or your preferred subdomain)
   - Domain: `example.com`
   - Service: `http://grimar:3000`

### Method 2: CLI

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared

# Authenticate
./cloudflared tunnel login

# Create tunnel
./cloudflared tunnel create grimar-tunnel

# Route tunnel to your domain
./cloudflared tunnel route dns grimar-tunnel dnd.example.com

# Run tunnel (for testing)
./cloudflared tunnel --url http://localhost:3000 run grimar-tunnel
```

### Cloudflare Access (Optional Authentication)

1. Go to **Access** > **Applications**
2. Create an application for `dnd.example.com`
3. Add an **Access Policy** (e.g., email domain, GitHub org)
4. Configure header modification:
   - Header name: `X-Authentik-Username`
   - Value: Use Cloudflare Access user attributes

## Traefik Reverse Proxy

Traefik is a popular reverse proxy that integrates well with Docker. It provides automatic SSL via Let's Encrypt and easy service discovery through Docker labels.

### Basic Traefik Setup

1. Create the Traefik network:
   ```bash
   docker network create web
   ```

2. Create `docker-compose.traefik.yml`:
   ```yaml
   version: "3.8"

   services:
     traefik:
       image: traefik:v3
       container_name: traefik
       restart: unless-stopped
       command:
         - "--api.dashboard=true"
         - "--api.insecure=false"
         - "--providers.docker=true"
         - "--providers.docker.exposedbydefault=false"
         - "--entrypoints.web.address=:80"
         - "--entrypoints.websecure.address=:443"
         - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
         - "--certificatesresolvers.myresolver.acme.email=admin@example.com"
         - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./letsencrypt:/letsencrypt
         - /var/run/docker.sock:/var/run/docker.sock:ro
       networks:
         - web

     grimar:
       build: .
       container_name: grimar
       restart: unless-stopped
       volumes:
         - grimar-data:/app/data
       environment:
         - DATABASE_URL=/app/data/grimar.db
         - ORIGIN=https://dnd.example.com
       networks:
         - web
       labels:
         traefik.enable: true
         traefik.http.routers.grimar.rule: Host(`dnd.example.com`)
         traefik.http.routers.grimar.entrypoints: websecure
         traefik.http.routers.grimar.tls.certresolver: myresolver
         traefik.http.services.grimar.loadbalancer.server.port: 3000

   networks:
     web:

   volumes:
     grimar-data:
   ```

3. Start:
   ```bash
   docker compose -f docker-compose.traefik.yml up -d
   ```

### Traefik with HTTP-to-HTTPS Redirect

Add redirect middleware:

```yaml
services:
  traefik:
    # ... other config
    command:
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
```

### Traefik with Basic Auth

1. Generate password hash:
   ```bash
   htpasswd -nbB admin "your-password"
   ```

2. Add middleware labels to grimar:
   ```yaml
   labels:
     traefik.enable: true
     traefik.http.routers.grimar.rule: Host(`dnd.example.com`)
     traefik.http.routers.grimar.entrypoints: websecure
     traefik.http.routers.grimar.tls.certresolver: myresolver
     traefik.http.routers.grimar.middlewares: grimar-auth
     traefik.http.middlewares.grimar-auth.basicauth.users: admin:$$2y$$05$$...
     traefik.http.services.grimar.loadbalancer.server.port: 3000
   ```

### Traefik with Authentik (Recommended for Production)

1. Ensure Authentik is running with the outpost proxy
2. Add the middleware label:
   ```yaml
   labels:
     traefik.http.routers.grimar.middlewares: authentik@docker
   ```

3. In Authentik, create an application with the proxy provider
4. Configure Authentik to pass `X-Authentik-Username` header

### Traefik Labels Reference

| Label | Description |
|-------|-------------|
| `traefik.enable` | Enable Traefik for this container |
| `traefik.http.routers.<name>.rule` | Routing rule (usually `Host()`) |
| `traefik.http.routers.<name>.entrypoints` | Entry points (websecure for HTTPS) |
| `traefik.http.routers.<name>.tls.certresolver` | Certificate resolver name |
| `traefik.http.routers.<name>.middlewares` | Middlewares to apply |
| `traefik.http.services.<name>.loadbalancer.server.port` | Internal container port |

### Existing Infrastructure (Traefik + Authentik + Cloudflared)

If you already have Traefik, Authentik, and cloudflared running, just add grimar to your existing compose or create a standalone compose file:

```yaml
# docker-compose.grimar.yml
version: "3.8"

services:
  grimar:
    image: ghcr.io/your-org/grimar:latest  # or build: .
    container_name: grimar
    restart: unless-stopped
    volumes:
      - grimar-data:/app/data
    environment:
      - DATABASE_URL=/app/data/grimar.db
      - ORIGIN=https://dnd.example.com
    networks:
      - traefik_proxy
      - authentik_internal
    labels:
      traefik.enable: true
      traefik.http.routers.grimar.rule: Host(`dnd.example.com`)
      traefik.http.routers.grimar.entrypoints: websecure
      traefik.http.routers.grimar.tls.certresolver: myresolver
      traefik.http.routers.grimar.middlewares: authentik@docker
      traefik.http.services.grimar.loadbalancer.server.port: 3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  traefik_proxy:
    external: true
  authentik_internal:
    external: true

volumes:
  grimar-data:
```

**Authentik Configuration:**

1. Create a **Proxy Provider** in Authentik
2. Set **External Host**: `https://dnd.example.com`
3. Set **Internal Host**: `http://grimar:3000`
4. Enable **Pass headers** and ensure `X-Authentik-Username` is forwarded
5. Create an **Application** using this provider

**Cloudflared (if routing through CF):**

In your existing Cloudflare Tunnel config, add a hostname pointing to `http://grimar:3000` (or through Traefik: `http://traefik:80`).

**Deploy:**
```bash
docker compose -f docker-compose.grimar.yml up -d
```

## Podman Commands

Podman is a drop-in replacement for Docker. Use `podman` or `podman-compose` instead:

```bash
# Build
podman build -t grimar:latest .

# Run
podman run -d \
  --name grimar \
  -v grimar-data:/app/data \
  -p 3000:3000 \
  -e DATABASE_URL=/app/data/grimar.db \
  grimar:latest

# With podman-compose
podman-compose up -d
```

## Data Persistence

The SQLite database is stored in `/app/data` inside the container. To persist data:

1. **Named volume** (recommended):
   ```yaml
   volumes:
     - grimar-data:/app/data
   ```

2. **Bind mount**:
   ```yaml
   volumes:
     - ./data:/app/data
   ```

## Health Checks

The container includes a health check. Monitor with:

```bash
docker inspect --format='{{.State.Health.Status}}' grimar
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose build --no-cache
docker compose up -d
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs grimar

# Check container status
docker compose ps
```

### Database issues

```bash
# Access container shell
docker exec -it grimar sh

# Check database exists
ls -la /app/data/

# Run database sync
bun run db:sync
```

### Cloudflare Tunnel not connecting

```bash
# Check cloudflared logs
docker compose logs cloudflared

# Verify token is set
docker compose exec cloudflared env | grep TUNNEL
```

## Security Considerations

1. **Authentication**: Always use authentication (Cloudflare Access or reverse proxy auth)
2. **HTTPS**: Cloudflare Tunnel provides automatic HTTPS
3. **Database**: SQLite file is stored inside container; back up regularly
4. **Updates**: Keep container and dependencies updated
5. **Secrets**: Never commit `.env` files; use Docker secrets or environment injection

## Backup

```bash
# Backup database
docker cp grimar:/app/data/grimar.db ./backup-$(date +%Y%m%d).db

# Or with bind mount
cp ./data/grimar.db ./backup-$(date +%Y%m%d).db
```

## Alternative: Direct Cloudflared (No Docker)

If you prefer running the app directly:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and build
git clone https://github.com/your-repo/dnd-pwa.git
cd dnd-pwa
bun install
bun run build

# Run with cloudflared
cloudflared tunnel --url http://localhost:3000 run grimar-tunnel & bun run start
```
