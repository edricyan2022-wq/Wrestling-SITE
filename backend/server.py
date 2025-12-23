from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import base64
import re
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'edric.yan2022@gmail.com')

# Subscription pricing
SUBSCRIPTION_PLANS = {
    "free": {"price": 0.0, "name": "Free Plan", "features": ["Basic wrestling techniques", "Beginner tutorials"]},
    "monthly": {"price": 19.99, "name": "Monthly Pro", "features": ["All basic techniques", "Secret techniques", "Advanced moves", "Priority support"]},
    "annual": {"price": 149.99, "name": "Annual Pro", "features": ["All basic techniques", "Secret techniques", "Advanced moves", "Priority support", "2 months free"]}
}

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    subscription_plan: str = "free"
    subscription_expires: Optional[datetime] = None
    created_at: datetime

class UserSession(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

class Video(BaseModel):
    video_id: str
    title: str
    description: str
    category: str
    video_url: str
    thumbnail_url: Optional[str] = None
    is_premium: bool = False
    order: int = 0
    created_at: datetime

class VideoCreate(BaseModel):
    title: str
    description: str
    category: str
    video_url: str
    thumbnail_url: Optional[str] = None
    is_premium: bool = False

def extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/shorts\/([^&\n?#]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def convert_to_embed_url(url: str) -> str:
    """Convert any YouTube URL to embed format"""
    video_id = extract_youtube_id(url)
    if video_id:
        return f"https://www.youtube.com/embed/{video_id}"
    return url  # Return as-is if not a YouTube URL

class PaymentTransaction(BaseModel):
    transaction_id: str
    session_id: str
    user_id: str
    email: str
    amount: float
    currency: str
    plan: str
    status: str
    payment_status: str
    created_at: datetime

# Auth endpoints
@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process session_id from Google OAuth and create user session"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Fetch user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = auth_response.json()
    
    email = user_data.get("email")
    name = user_data.get("name")
    picture = user_data.get("picture")
    session_token = user_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "subscription_plan": "free",
            "subscription_expires": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Get user data
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "subscription_plan": user.get("subscription_plan", "free"),
        "is_admin": user["email"] == ADMIN_EMAIL
    }

async def get_current_user(request: Request):
    """Helper to get current user from session"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    # Check expiry
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "subscription_plan": user.get("subscription_plan", "free"),
        "subscription_expires": user.get("subscription_expires"),
        "is_admin": user["email"] == ADMIN_EMAIL
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out successfully"}

# Video endpoints
@api_router.get("/videos")
async def get_videos(request: Request):
    """Get all videos, filtered by user subscription"""
    user = await get_current_user(request)
    
    videos = await db.videos.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    
    # Check user subscription
    has_premium = False
    if user:
        plan = user.get("subscription_plan", "free")
        if plan in ["monthly", "annual"]:
            expires = user.get("subscription_expires")
            if expires:
                if isinstance(expires, str):
                    expires = datetime.fromisoformat(expires)
                if expires.tzinfo is None:
                    expires = expires.replace(tzinfo=timezone.utc)
                has_premium = expires > datetime.now(timezone.utc)
    
    # Mark locked videos
    for video in videos:
        video["is_locked"] = video.get("is_premium", False) and not has_premium
    
    return videos

@api_router.get("/videos/{video_id}")
async def get_video(video_id: str, request: Request):
    """Get single video"""
    user = await get_current_user(request)
    
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check premium access
    if video.get("is_premium", False):
        if not user:
            raise HTTPException(status_code=401, detail="Login required for premium content")
        
        plan = user.get("subscription_plan", "free")
        if plan not in ["monthly", "annual"]:
            raise HTTPException(status_code=403, detail="Premium subscription required")
        
        expires = user.get("subscription_expires")
        if expires:
            if isinstance(expires, str):
                expires = datetime.fromisoformat(expires)
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires < datetime.now(timezone.utc):
                raise HTTPException(status_code=403, detail="Subscription expired")
    
    return video

@api_router.post("/videos")
async def create_video(video: VideoCreate, request: Request):
    """Create video (admin only)"""
    user = await get_current_user(request)
    if not user or user["email"] != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get next order number
    last_video = await db.videos.find_one(sort=[("order", -1)])
    next_order = (last_video.get("order", 0) + 1) if last_video else 1
    
    video_doc = {
        "video_id": f"vid_{uuid.uuid4().hex[:12]}",
        "title": video.title,
        "description": video.description,
        "category": video.category,
        "video_url": video.video_url,
        "thumbnail_url": video.thumbnail_url,
        "is_premium": video.is_premium,
        "order": next_order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.videos.insert_one(video_doc)
    del video_doc["_id"]
    return video_doc

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, request: Request):
    """Delete video (admin only)"""
    user = await get_current_user(request)
    if not user or user["email"] != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.videos.delete_one({"video_id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {"message": "Video deleted"}

@api_router.get("/categories")
async def get_categories():
    """Get video categories"""
    categories = await db.videos.distinct("category")
    return categories

# Payment endpoints
@api_router.post("/payments/create-checkout")
async def create_checkout(request: Request):
    """Create Stripe checkout session"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login required")
    
    data = await request.json()
    plan = data.get("plan")
    origin_url = data.get("origin_url")
    
    if plan not in ["monthly", "annual"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")
    
    amount = SUBSCRIPTION_PLANS[plan]["price"]
    
    # Initialize Stripe
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/pricing"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "email": user["email"],
            "plan": plan
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "amount": amount,
        "currency": "usd",
        "plan": plan,
        "status": "pending",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    """Get payment status and update subscription if paid"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login required")
    
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction and transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "plan": transaction.get("plan")
        }
    
    # Get status from Stripe
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    if status.payment_status == "paid":
        # Get plan from transaction
        if transaction:
            plan = transaction.get("plan", "monthly")
            
            # Calculate expiry
            if plan == "monthly":
                expires = datetime.now(timezone.utc) + timedelta(days=30)
            else:  # annual
                expires = datetime.now(timezone.utc) + timedelta(days=365)
            
            # Update user subscription
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {
                    "subscription_plan": plan,
                    "subscription_expires": expires.isoformat()
                }}
            )
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid"
                }}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            # Update transaction and user
            transaction = await db.payment_transactions.find_one(
                {"session_id": event.session_id},
                {"_id": 0}
            )
            
            if transaction and transaction.get("payment_status") != "paid":
                plan = event.metadata.get("plan", "monthly")
                user_id = event.metadata.get("user_id")
                
                if plan == "monthly":
                    expires = datetime.now(timezone.utc) + timedelta(days=30)
                else:
                    expires = datetime.now(timezone.utc) + timedelta(days=365)
                
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "subscription_plan": plan,
                        "subscription_expires": expires.isoformat()
                    }}
                )
                
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {
                        "status": "complete",
                        "payment_status": "paid"
                    }}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error"}

@api_router.get("/plans")
async def get_plans():
    """Get subscription plans"""
    return SUBSCRIPTION_PLANS

@api_router.get("/")
async def root():
    return {"message": "Iron Hold Wrestling API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
