import httpx
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions


def create_supabase_client(url: str, key: str) -> Client:
    # postgrest defaults to a shared HTTP/2 connection, which is not thread-safe: concurrent
    # requests from FastAPI's threadpool corrupt its header compression state
    # (COMPRESSION_ERROR / EAGAIN). An HTTP/1.1 pool is safe to share across threads.
    http_client = httpx.Client(timeout=30, follow_redirects=True)
    return create_client(url, key, options=SyncClientOptions(httpx_client=http_client))
