# ============================================================
# main.py — FastAPI Backend for Zenith Bank Clone
# ============================================================
# Think of this like app.js in Express — the entry point.
#
# In Express:   app.get("/api/health", (req, res) => { ... })
# In FastAPI:   @app.get("/api/health")
#               def health_check(): ...
#
# Interactive API docs: http://localhost:8000/docs
# ============================================================

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os, httpx, uuid
from jose import jwt, JWTError

load_dotenv()

SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SECRET   = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")

app = FastAPI(title="Zenith Bank API", version="1.0.0")

# ============================================================
# CORS — allows the Next.js frontend to call this backend
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SUPABASE HELPER
# ============================================================
# Instead of the Python supabase library (which rejects the
# new sb_secret_ key format), we call Supabase's REST API
# directly using httpx. This is exactly what the JS SDK does
# under the hood — just HTTP requests with JSON.
# ============================================================
def supabase_get(table: str, params: dict = None) -> list:
    """
    Fetch rows from a Supabase table.
    Equivalent to: supabase.from(table).select(...)
    """
    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": SUPABASE_SECRET,
            "Authorization": f"Bearer {SUPABASE_SECRET}",
            "Content-Type": "application/json",
        },
        params=params or {},
        timeout=10
    )
    if resp.status_code not in (200, 206):
        raise HTTPException(status_code=500, detail=f"Database error: {resp.text}")
    return resp.json()


def supabase_post(table: str, data: dict) -> dict:
    """
    Insert a row into a Supabase table.
    Equivalent to: supabase.from(table).insert(data)
    """
    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": SUPABASE_SECRET,
            "Authorization": f"Bearer {SUPABASE_SECRET}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        json=data,
        timeout=10
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=f"Database error: {resp.text}")
    result = resp.json()
    return result[0] if isinstance(result, list) and result else result


def supabase_patch(table: str, match: dict, data: dict) -> dict:
    """
    Update rows in a Supabase table.
    Equivalent to: supabase.from(table).update(data).match(match)
    """
    # Build query params for the WHERE clause (e.g. id=eq.abc-123)
    params = {k: f"eq.{v}" for k, v in match.items()}
    resp = httpx.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": SUPABASE_SECRET,
            "Authorization": f"Bearer {SUPABASE_SECRET}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        params=params,
        json=data,
        timeout=10
    )
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=500, detail=f"Database error: {resp.text}")
    result = resp.json()
    return result[0] if isinstance(result, list) and result else result


# ============================================================
# JWT VERIFICATION
# ============================================================
# When the frontend calls a protected endpoint, it sends a
# JWT token in the Authorization header.
# We verify the token is valid before trusting the request.
# ============================================================
def verify_token(authorization: str = None) -> dict:
    """
    Verifies the Supabase JWT from the Authorization header.
    Returns the decoded payload (contains user ID, email, etc.)
    Raises HTTP 401 if missing or invalid.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header format.")

    token = parts[1]

    try:
        # Fetch Supabase's public keys to verify the token signature
        jwks_resp = httpx.get(SUPABASE_JWKS_URL, timeout=10)
        jwks = jwks_resp.json()

        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        alg = unverified_header.get("alg", "RS256")

        # Find the matching key
        rsa_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                rsa_key = key
                break

        if not rsa_key:
            raise HTTPException(status_code=401, detail="Token signing key not found.")

        payload = jwt.decode(token, rsa_key, algorithms=[alg], audience="authenticated")
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired. Please log in again.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Could not verify token.")


# ============================================================
# REQUEST BODY MODELS
# ============================================================
# Pydantic models define the shape of POST request bodies.
# FastAPI validates them automatically — like express-validator.

class TransferRequest(BaseModel):
    beneficiary_name: str
    beneficiary_account: str
    bank_name: str
    amount: float
    description: str

class AirtimeRequest(BaseModel):
    network: str
    phone_number: str
    amount: float

class BillsRequest(BaseModel):
    bill_type: str
    customer_number: str
    amount: float


# ============================================================
# HEALTH CHECK
# ============================================================
@app.get("/api/health")
def health_check():
    return {"success": True, "message": "Zenith Bank backend is running!"}


@app.get("/")
def root():
    return {"message": "Zenith Bank API", "docs": "Visit /docs"}


# ============================================================
# ACCOUNT — GET /api/account
# ============================================================
# Returns the logged-in user's profile and account details.
# Protected: requires a valid JWT token.
# ============================================================
@app.get("/api/account")
def get_account(authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    # Fetch the user's profile from the profiles table
    profiles = supabase_get("profiles", {"id": f"eq.{user_id}", "select": "*"})

    # Fetch the user's account from the accounts table
    accounts = supabase_get("accounts", {"user_id": f"eq.{user_id}", "select": "*", "limit": "1"})

    if not profiles or not accounts:
        # Profile/account not found — return safe defaults so the
        # dashboard doesn't crash while the user sets up their data
        return {
            "success": True,
            "profile": {
                "full_name": payload.get("email", "User"),
                "email": payload.get("email", ""),
                "phone": ""
            },
            "account": {
                "account_number": "0000000000",
                "account_type": "Current Account",
                "balance": 0.00
            }
        }

    profile = profiles[0]
    account = accounts[0]

    return {
        "success": True,
        "profile": {
            "full_name": profile["full_name"],
            "email": profile["email"],
            "phone": profile["phone"]
        },
        "account": {
            "id": account["id"],
            "account_number": account["account_number"],
            "account_type": account["account_type"],
            "balance": float(account["balance"])
        }
    }


# ============================================================
# TRANSACTIONS — GET /api/transactions
# ============================================================
# Returns the user's transaction history, newest first.
# Optional query param: ?limit=10
# ============================================================
@app.get("/api/transactions")
def get_transactions(authorization: str = Header(None), limit: int = 20):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    # Fetch transactions for this user, sorted by newest first
    transactions = supabase_get("transactions", {
        "user_id": f"eq.{user_id}",
        "select": "*",
        "order": "created_at.desc",
        "limit": str(limit)
    })

    return {
        "success": True,
        "transactions": transactions
    }


# ============================================================
# TRANSFER — POST /api/transfers
# ============================================================
# Simulates a bank transfer.
# Does NOT move real money — just creates a transaction record.
# ============================================================
@app.post("/api/transfers")
def create_transfer(body: TransferRequest, authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    # Get the user's account
    accounts = supabase_get("accounts", {"user_id": f"eq.{user_id}", "limit": "1"})
    if not accounts:
        raise HTTPException(status_code=404, detail="Account not found.")

    account = accounts[0]
    current_balance = float(account["balance"])

    # Check the user has enough money
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if body.amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    # Deduct the amount from the balance
    new_balance = current_balance - body.amount
    supabase_patch("accounts", {"id": account["id"]}, {"balance": new_balance})

    # Create a transaction record for this transfer
    reference = f"TXN-TRF-{uuid.uuid4().hex[:8].upper()}"
    transaction = supabase_post("transactions", {
        "user_id": user_id,
        "account_id": account["id"],
        "type": "debit",
        "description": f"Transfer to {body.beneficiary_name}",
        "amount": body.amount,
        "status": "success",
        "reference": reference
    })

    return {
        "success": True,
        "message": "Transfer successful",
        "reference": reference,
        "new_balance": new_balance
    }


# ============================================================
# AIRTIME — POST /api/airtime
# ============================================================
# Simulates buying airtime. Creates a debit transaction.
# ============================================================
@app.post("/api/airtime")
def buy_airtime(body: AirtimeRequest, authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    accounts = supabase_get("accounts", {"user_id": f"eq.{user_id}", "limit": "1"})
    if not accounts:
        raise HTTPException(status_code=404, detail="Account not found.")

    account = accounts[0]
    current_balance = float(account["balance"])

    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if body.amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    new_balance = current_balance - body.amount
    supabase_patch("accounts", {"id": account["id"]}, {"balance": new_balance})

    reference = f"TXN-AIR-{uuid.uuid4().hex[:8].upper()}"
    supabase_post("transactions", {
        "user_id": user_id,
        "account_id": account["id"],
        "type": "debit",
        "description": f"{body.network} Airtime - {body.phone_number}",
        "amount": body.amount,
        "status": "success",
        "reference": reference
    })

    return {
        "success": True,
        "message": f"₦{body.amount:,.2f} airtime sent to {body.phone_number}",
        "reference": reference,
        "new_balance": new_balance
    }


# ============================================================
# BILLS — POST /api/bills
# ============================================================
# Simulates paying a utility bill. Creates a debit transaction.
# ============================================================
@app.post("/api/bills")
def pay_bill(body: BillsRequest, authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    accounts = supabase_get("accounts", {"user_id": f"eq.{user_id}", "limit": "1"})
    if not accounts:
        raise HTTPException(status_code=404, detail="Account not found.")

    account = accounts[0]
    current_balance = float(account["balance"])

    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if body.amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    new_balance = current_balance - body.amount
    supabase_patch("accounts", {"id": account["id"]}, {"balance": new_balance})

    reference = f"TXN-BIL-{uuid.uuid4().hex[:8].upper()}"
    supabase_post("transactions", {
        "user_id": user_id,
        "account_id": account["id"],
        "type": "debit",
        "description": f"{body.bill_type} - {body.customer_number}",
        "amount": body.amount,
        "status": "success",
        "reference": reference
    })

    return {
        "success": True,
        "message": f"{body.bill_type} payment of ₦{body.amount:,.2f} successful",
        "reference": reference,
        "new_balance": new_balance
    }


# ============================================================
# BENEFICIARIES — GET /api/beneficiaries
# ============================================================
@app.get("/api/beneficiaries")
def get_beneficiaries(authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    beneficiaries = supabase_get("beneficiaries", {
        "user_id": f"eq.{user_id}",
        "select": "*",
        "order": "created_at.desc"
    })

    return {"success": True, "beneficiaries": beneficiaries}


# ============================================================
# PROFILE — GET /api/profile
# ============================================================
# Returns the logged-in user's profile and account summary.
# Used by the Profile page. Same data as /api/account but
# named separately so it's clear what each endpoint is for.
# ============================================================
@app.get("/api/profile")
def get_profile(authorization: str = Header(None)):
    payload = verify_token(authorization)
    user_id = payload.get("sub")

    profiles = supabase_get("profiles", {"id": f"eq.{user_id}", "select": "*"})
    accounts = supabase_get("accounts", {"user_id": f"eq.{user_id}", "select": "*", "limit": "1"})

    # Graceful fallback if tables not set up yet
    profile = profiles[0] if profiles else {
        "full_name": payload.get("email", "User"),
        "email":     payload.get("email", ""),
        "phone":     "",
        "created_at": None
    }
    account = accounts[0] if accounts else {
        "account_number": "0000000000",
        "account_type":   "Current Account",
        "balance":        0.00
    }

    return {
        "success": True,
        "profile": {
            "full_name":  profile["full_name"],
            "email":      profile["email"],
            "phone":      profile["phone"],
            "created_at": profile.get("created_at")
        },
        "account": {
            "account_number": account["account_number"],
            "account_type":   account["account_type"],
            "balance":        float(account["balance"])
        }
    }
