# Self-hosting the upstream Open5e API

Grimar syncs the open-source [Open5e API](https://github.com/open5e/open5e-api). Its upstream server uses Python 3.11, Django, and Gunicorn. The upstream Dockerfile initializes its SQLite dataset with `manage.py quicksetup` and serves it on port 8888.

ChatGPT Sites hosts Cloudflare-compatible Worker output. It cannot run this Django/Gunicorn container directly. No replacement API or Sites proxy has been deployed: a proxy would still depend on an external Open5e server and would not fulfill self-hosting.

For a container-capable host, use the upstream build rather than a rewritten subset of its API. Check out a reviewed upstream commit, then build and start it using its Dockerfile:

```bash
git clone https://github.com/open5e/open5e-api.git
cd open5e-api
git checkout <reviewed-commit>
docker build -t open5e-local .
docker run -d --name open5e --restart unless-stopped -p 127.0.0.1:8888:8888 open5e-local
```

The build imports the upstream data into the image. Rebuilding at a new upstream commit updates the data. Review upstream settings, supported environment variables, and licensing/attribution requirements before exposing the service outside the host. Put it behind your existing reverse proxy for a remote Grimar server; binding to localhost above is suitable when both services run on the same host network. Separate containers need a shared private container network and its service address instead.

Configure Grimar's server environment to the reachable API:

```dotenv
OPEN5E_API_BASE_URL=http://127.0.0.1:8888/v2
```

For a private network address or reverse-proxy hostname, replace the host accordingly. Restart Grimar, then run `bun run db:sync` with that environment. Normal compendium browsing reads Grimar's local SQLite snapshot rather than fetching Open5e for every card; proxied artwork may still require the upstream server.

These are deployment instructions, not a claim that this environment has deployed or verified a running upstream container. Hosting the actual upstream server on ChatGPT Sites would require platform support for its Python/container runtime.
