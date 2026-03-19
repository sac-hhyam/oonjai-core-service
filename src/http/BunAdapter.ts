import type {Router} from "@http/Router"

export interface BunAdapterOptions {
  port?: number
  hostname?: string
  /** Allowed CORS origins. Defaults to "*" for local development. */
  allowedOrigins?: string[]
}

const CORS_HEADERS = (origin: string, allowed: string[]): Record<string, string> => {
  const allowedOrigin = allowed.includes("*") || allowed.includes(origin) ? origin : allowed[0] ?? "*"
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  }
}

export function serveBun(router: Router, options: BunAdapterOptions = {}): void {
  const {port = 3000, hostname = "0.0.0.0", allowedOrigins = ["*"]} = options

  Bun.serve({
    port,
    hostname,
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url)
      const origin = req.headers.get("origin") ?? "*"
      const cors = CORS_HEADERS(origin, allowedOrigins)

      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, {status: 204, headers: cors})
      }

      // Serve static files from ./public/
      if (req.method === "GET") {
        const staticFile = Bun.file(`./public${url.pathname}`)
        if (await staticFile.exists()) {
          return new Response(staticFile, {headers: cors})
        }
      }

      const query: Record<string, string> = {}
      url.searchParams.forEach((value, key) => {
        query[key] = value
      })

      const headers: Record<string, string> = {}
      req.headers.forEach((value, key) => {
        headers[key] = value
      })

      let body: unknown = undefined
      const reqContentType = req.headers.get("content-type") ?? ""
      if (reqContentType.includes("application/json") && req.body) {
        try {
          body = await req.json()
        } catch {
          body = undefined
        }
      }

      const result = await router.dispatch(req.method, url.pathname, {query, headers, body, params: {}})

      if (result.redirect) {
        return new Response(null, {
          status: result.status,
          headers: {"Location": result.redirect, ...cors},
        })
      }

      const resContentType = result.contentType ?? "application/json"
      const responseBody =
        result.body !== undefined
          ? resContentType.startsWith("text/") ? (result.body as string) : JSON.stringify(result.body)
          : null

      return new Response(responseBody, {
        status: result.status,
        headers: {"Content-Type": resContentType, ...cors},
      })
    },
  })

  console.log(`Server running on http://${hostname}:${port}`)
}
