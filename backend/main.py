from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers="*",
)

SITES_DB = [
  {"url": "https://google.com", "status": "unknown"},
  {"url": "https://github.com", "status": "unknown"}
]

class SiteModel(BaseModel):
  url: str

@app.get("/api/sites")
async def get_sites():
  result = []
  async with httpx.AsyncClient(timeout=3.0) as client:
    for site in SITES_DB:
      try:
        response = await client.get(site["url"])
        if response.status_code < 400:
          status = f"UP ({response.status_code})"
        else:
          status = f"DOWN ({response.status_code})"
      except Exception:
        status = "DOWN (No connection)"

      result.append({"url": site["url"], "status": status})
  return result

@app.post("/api/sites")
async def add_site(site: SiteModel):
  if not site.url.startswith("http://") and not site.url.startswith("https://"):
    raise HTTPException(status_code=400, detail="Ссылка должна начинаться с http:// или https://")

  if any(s["url"] == site.url for s in SITES_DB):
    raise HTTPException(status_code=400, detail="Этот сайт уже добавлен")

  SITES_DB.append({"url": site.url, "status": "unknown"})
  return {"message": "Сайт успешно добавлен"}