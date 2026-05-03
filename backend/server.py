from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# =============================================================================
# Configuration & DB
# =============================================================================
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MIN = 60 * 24  # 24 hours for ease of use
COOKIE_MAX_AGE = ACCESS_TOKEN_TTL_MIN * 60

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Zalites Pamatskola API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# =============================================================================
# Models
# =============================================================================
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class NewsPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    image: Optional[str] = None  # base64 data URL
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NewsIn(BaseModel):
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    image: Optional[str] = None


DAYS = Literal["Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena"]


class ScheduleEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group: str
    subject: str
    teacher: str
    day: str
    start_time: str  # HH:MM
    end_time: str
    room: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScheduleIn(BaseModel):
    group: str = Field(min_length=1)
    subject: str = Field(min_length=1)
    teacher: str = Field(min_length=1)
    day: str = Field(min_length=1)
    start_time: str
    end_time: str
    room: Optional[str] = None


class PageContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    slug: str
    title: str
    body: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PageContentIn(BaseModel):
    title: str
    body: str


# =============================================================================
# Auth utilities
# =============================================================================
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key="access_token", path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Nav autentificēts")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Nederīgs marķiera tips")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Lietotājs nav atrasts")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Marķieris ir beidzies")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Nederīgs marķieris")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Pieeja liegta")
    return user


# =============================================================================
# Helpers
# =============================================================================
def serialize_user(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "email": doc["email"],
        "name": doc.get("name", ""),
        "role": doc.get("role", "admin"),
        "created_at": doc.get("created_at"),
    }


# =============================================================================
# Auth endpoints
# =============================================================================
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Nepareizs e-pasts vai parole")

    token = create_access_token(user["id"], user["email"])
    set_auth_cookie(response, token)
    return {"user": serialize_user(user), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    clear_auth_cookie(response)
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


# =============================================================================
# News endpoints
# =============================================================================
@api_router.get("/news")
async def list_news():
    docs = await db.news.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/news/{news_id}")
async def get_news(news_id: str):
    doc = await db.news.find_one({"id": news_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Ziņa nav atrasta")
    return doc


@api_router.post("/news", status_code=201)
async def create_news(payload: NewsIn, _admin: dict = Depends(require_admin)):
    obj = NewsPost(**payload.model_dump())
    doc = obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.news.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.put("/news/{news_id}")
async def update_news(news_id: str, payload: NewsIn, _admin: dict = Depends(require_admin)):
    update_doc = payload.model_dump()
    update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.news.update_one({"id": news_id}, {"$set": update_doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ziņa nav atrasta")
    doc = await db.news.find_one({"id": news_id}, {"_id": 0})
    return doc


@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, _admin: dict = Depends(require_admin)):
    res = await db.news.delete_one({"id": news_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ziņa nav atrasta")
    return {"ok": True}


# =============================================================================
# Schedule endpoints (with conflict detection)
# =============================================================================
def _times_overlap(a_start: str, a_end: str, b_start: str, b_end: str) -> bool:
    return a_start < b_end and b_start < a_end


async def _find_conflicts(entry: dict, exclude_id: Optional[str] = None) -> List[dict]:
    """Return list of schedule entries that conflict with given entry by teacher OR group on same day at overlapping time."""
    query: dict = {"day": entry["day"]}
    if exclude_id:
        query["id"] = {"$ne": exclude_id}
    same_day = await db.schedule.find(query, {"_id": 0}).to_list(2000)
    conflicts = []
    for other in same_day:
        if not _times_overlap(entry["start_time"], entry["end_time"], other["start_time"], other["end_time"]):
            continue
        if other["teacher"].strip().lower() == entry["teacher"].strip().lower():
            conflicts.append({**other, "reason": "teacher"})
        elif other["group"].strip().lower() == entry["group"].strip().lower():
            conflicts.append({**other, "reason": "group"})
    return conflicts


@api_router.get("/schedule")
async def list_schedule(group: Optional[str] = None):
    query = {}
    if group:
        query["group"] = group
    docs = await db.schedule.find(query, {"_id": 0}).to_list(2000)
    # sort by day order then start_time
    day_order = {"Pirmdiena": 1, "Otrdiena": 2, "Trešdiena": 3, "Ceturtdiena": 4, "Piektdiena": 5, "Sestdiena": 6, "Svētdiena": 7}
    docs.sort(key=lambda d: (day_order.get(d.get("day"), 99), d.get("start_time", "")))
    return docs


@api_router.get("/schedule/groups")
async def list_groups():
    groups = await db.schedule.distinct("group")
    return sorted(groups)


@api_router.get("/schedule/conflicts")
async def list_conflicts(_admin: dict = Depends(require_admin)):
    """Return ids of all entries that have a conflict."""
    all_entries = await db.schedule.find({}, {"_id": 0}).to_list(2000)
    conflict_ids = set()
    for i, a in enumerate(all_entries):
        for b in all_entries[i + 1 :]:
            if a["day"] != b["day"]:
                continue
            if not _times_overlap(a["start_time"], a["end_time"], b["start_time"], b["end_time"]):
                continue
            if a["teacher"].strip().lower() == b["teacher"].strip().lower() or a["group"].strip().lower() == b["group"].strip().lower():
                conflict_ids.add(a["id"])
                conflict_ids.add(b["id"])
    return list(conflict_ids)


@api_router.post("/schedule", status_code=201)
async def create_schedule(payload: ScheduleIn, _admin: dict = Depends(require_admin)):
    obj = ScheduleEntry(**payload.model_dump())
    doc = obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    conflicts = await _find_conflicts(doc)
    await db.schedule.insert_one(doc)
    return {"entry": {k: v for k, v in doc.items() if k != "_id"}, "conflicts": conflicts}


@api_router.put("/schedule/{entry_id}")
async def update_schedule(entry_id: str, payload: ScheduleIn, _admin: dict = Depends(require_admin)):
    update_doc = payload.model_dump()
    res = await db.schedule.update_one({"id": entry_id}, {"$set": update_doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ieraksts nav atrasts")
    doc = await db.schedule.find_one({"id": entry_id}, {"_id": 0})
    conflicts = await _find_conflicts(doc, exclude_id=entry_id)
    return {"entry": doc, "conflicts": conflicts}


@api_router.delete("/schedule/{entry_id}")
async def delete_schedule(entry_id: str, _admin: dict = Depends(require_admin)):
    res = await db.schedule.delete_one({"id": entry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ieraksts nav atrasts")
    return {"ok": True}


# =============================================================================
# Page content endpoints
# =============================================================================
ALLOWED_PAGES = {"history", "students", "teachers", "contacts"}


@api_router.get("/pages/{slug}")
async def get_page(slug: str):
    if slug not in ALLOWED_PAGES:
        raise HTTPException(status_code=404, detail="Lapa nav atrasta")
    doc = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        return {"slug": slug, "title": "", "body": "", "updated_at": datetime.now(timezone.utc).isoformat()}
    return doc


@api_router.put("/pages/{slug}")
async def update_page(slug: str, payload: PageContentIn, _admin: dict = Depends(require_admin)):
    if slug not in ALLOWED_PAGES:
        raise HTTPException(status_code=404, detail="Lapa nav atrasta")
    update_doc = {
        "slug": slug,
        "title": payload.title,
        "body": payload.body,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.pages.update_one({"slug": slug}, {"$set": update_doc}, upsert=True)
    return update_doc


# =============================================================================
# User management endpoints (admin)
# =============================================================================
@api_router.get("/users")
async def list_users(_admin: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return docs


@api_router.post("/users", status_code=201)
async def create_user(payload: UserCreate, _admin: dict = Depends(require_admin)):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Lietotājs ar šādu e-pastu jau pastāv")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "role": "admin",
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    return serialize_user(doc)


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Nevar dzēst sevi")
    # Prevent deleting last admin
    admin_count = await db.users.count_documents({"role": "admin"})
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="Lietotājs nav atrasts")
    if admin_count <= 1 and target.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Nevar dzēst pēdējo administratoru")
    res = await db.users.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lietotājs nav atrasts")
    return {"ok": True}


# =============================================================================
# Health
# =============================================================================
@api_router.get("/")
async def root():
    return {"message": "Zalites Pamatskola API"}


# =============================================================================
# Bootstrapping
# =============================================================================
DEFAULT_PAGES = {
    "history": {
        "title": "Zālītes pamatskolas vēsture",
        "body": (
            "Zālītes pamatskolas vēsture aizsākās 19. gadsimta beigās, kad mūsu draudzīgajā lauku kopienā "
            "tika dibināta pirmā skola. Kopš tā laika skola ir izaugusi un kļuvusi par mūsdienīgu mācību iestādi, "
            "saglabājot bagātās tradīcijas un kultūras mantojumu.\n\n"
            "Mūsu skola lepojas ar saviem absolventiem, daudzpusīgajiem mācību piedāvājumiem un siltajām attiecībām "
            "starp skolēniem, skolotājiem un vecākiem. Mēs ticam, ka katrs bērns ir unikāls un katram ir vieta, kur augt."
        ),
    },
    "students": {
        "title": "Skolēniem",
        "body": (
            "Mīļie skolēni! Šeit jūs atradīsiet noderīgu informāciju par mācību procesu, ārpusstundu aktivitātēm, "
            "interešu izglītību un skolas dzīvi.\n\n"
            "• Mācību sākums plkst. 8:30\n"
            "• Bibliotēka atvērta 9:00 - 16:00\n"
            "• Sporta zāle pieejama pēc stundām pulciņiem\n\n"
            "Atceries: katra diena ir jauna iespēja iemācīties ko jaunu!"
        ),
    },
    "teachers": {
        "title": "Skolotājiem",
        "body": (
            "Cienījamie kolēģi! Šī sadaļa veltīta mūsu pedagoģiskajam personālam.\n\n"
            "Šeit ir pieejama informācija par metodiskajiem materiāliem, pedagogu sanāksmēm, apmācībām un "
            "skolas iekšējiem dokumentiem. Vienoti veidojam kvalitatīvu izglītību mūsu skolēniem."
        ),
    },
    "contacts": {
        "title": "Kontakti",
        "body": (
            "Zālītes pamatskola\n"
            "Adrese: Skolas iela 1, Zālīte, LV-3995\n"
            "Tālrunis: +371 6312 3456\n"
            "E-pasts: info@zalitespamatskola.lv\n\n"
            "Direktors: Anna Bērziņa\n"
            "Direktora tālrunis: +371 2912 3456"
        ),
    },
}


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@zalitespamatskola.lv").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    now_iso = datetime.now(timezone.utc).isoformat()
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Administrators",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": now_iso,
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for: {admin_email}")


async def seed_pages():
    for slug, data in DEFAULT_PAGES.items():
        existing = await db.pages.find_one({"slug": slug})
        if not existing:
            await db.pages.insert_one({
                "slug": slug,
                "title": data["title"],
                "body": data["body"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })


async def seed_demo_data():
    news_count = await db.news.count_documents({})
    if news_count == 0:
        demos = [
            {
                "title": "Mācību gada svinīgais sākums",
                "content": "1. septembrī Zālītes pamatskolā svinīgi tika atklāts jaunais mācību gads. Direktore uzrunāja skolēnus, vecākus un skolotājus, vēlot veiksmīgu mācību gadu pilnu jaunu zināšanu, draudzības un piedzīvojumu.",
                "image": None,
            },
            {
                "title": "Rudens ražas svētki",
                "content": "Mūsu skolā notika tradicionālie Rudens svētki, kuros skolēni demonstrēja savas paša audzētās dārzeņu un augļu kompozīcijas. Konkursā uzvarēja 5.b klases ražas darbs.",
                "image": None,
            },
            {
                "title": "Sporta diena 'Olimpiskā stunda'",
                "content": "Visi skolēni piedalījās starptautiskajā Olimpiskās dienas pasākumā. Tika veikti dažādi sporta veidi, gūti jauni rekordi un, pats galvenais, kopā pavadīts neaizmirstams aktīvs laiks.",
                "image": None,
            },
        ]
        for d in demos:
            obj = NewsPost(**d).model_dump()
            obj["created_at"] = obj["created_at"].isoformat()
            obj["updated_at"] = obj["updated_at"].isoformat()
            await db.news.insert_one(obj)

    sched_count = await db.schedule.count_documents({})
    if sched_count == 0:
        demo_schedule = [
            ("5.a", "Matemātika", "Anna Bērziņa", "Pirmdiena", "08:30", "09:15", "204"),
            ("5.a", "Latviešu valoda", "Ilze Liepiņa", "Pirmdiena", "09:25", "10:10", "201"),
            ("5.a", "Angļu valoda", "Mārtiņš Kalniņš", "Pirmdiena", "10:25", "11:10", "208"),
            ("5.a", "Sports", "Jānis Ozols", "Otrdiena", "08:30", "09:15", "Sporta zāle"),
            ("5.a", "Mūzika", "Līga Vilks", "Otrdiena", "09:25", "10:10", "M1"),
            ("5.a", "Vēsture", "Pēteris Krūmiņš", "Trešdiena", "08:30", "09:15", "210"),
            ("5.b", "Latviešu valoda", "Ilze Liepiņa", "Pirmdiena", "08:30", "09:15", "201"),
            ("5.b", "Matemātika", "Anna Bērziņa", "Pirmdiena", "09:25", "10:10", "204"),
            ("5.b", "Dabaszinības", "Edgars Saulīte", "Otrdiena", "08:30", "09:15", "302"),
            ("5.b", "Sports", "Jānis Ozols", "Trešdiena", "09:25", "10:10", "Sporta zāle"),
            ("6.a", "Bioloģija", "Edgars Saulīte", "Pirmdiena", "08:30", "09:15", "302"),
            ("6.a", "Matemātika", "Anna Bērziņa", "Otrdiena", "10:25", "11:10", "204"),
            ("6.a", "Mākslā", "Līga Vilks", "Ceturtdiena", "08:30", "09:15", "M2"),
            ("6.a", "Angļu valoda", "Mārtiņš Kalniņš", "Piektdiena", "09:25", "10:10", "208"),
        ]
        for g, sub, t, d, st, et, r in demo_schedule:
            obj = ScheduleEntry(group=g, subject=sub, teacher=t, day=d, start_time=st, end_time=et, room=r).model_dump()
            obj["created_at"] = obj["created_at"].isoformat()
            await db.schedule.insert_one(obj)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.news.create_index("id", unique=True)
    await db.schedule.create_index("id", unique=True)
    await db.pages.create_index("slug", unique=True)
    await seed_admin()
    await seed_pages()
    await seed_demo_data()
    logger.info("Startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# =============================================================================
# Wire up
# =============================================================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
