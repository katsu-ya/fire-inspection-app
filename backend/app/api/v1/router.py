from fastapi import APIRouter

from app.api.v1 import auth, products, categories, inventory, alerts, reports

# v1ルーターの集約
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(inventory.router)
api_router.include_router(alerts.router)
api_router.include_router(reports.router)
