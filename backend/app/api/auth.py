from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import uuid
from typing import Optional
from app.database.connection import get_db
from app.models.user import UserModel
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, GoogleAuthRequest
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> UserModel:
    """Dependency to retrieve the currently authenticated user using JWT header validation."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session payload missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

@router.post("/register", response_model=TokenResponse)
def register(request: UserRegister, db: Session = Depends(get_db)):
    # Check for duplicate email
    existing_user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash passwords and generate unique IDs
    hashed = hash_password(request.password)
    user_id = str(uuid.uuid4())

    new_user = UserModel(
        id=user_id,
        name=request.name,
        email=request.email,
        password_hash=hashed
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token directly upon successful registration
    token = create_access_token(data={"sub": new_user.id})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(request: UserLogin, db: Session = Depends(get_db)):
    # Query user
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password combination."
        )

    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    # Stateless JWT logout, just verify that client clears token on their end
    return {"message": "Successfully logged out"}

@router.post("/google", response_model=TokenResponse)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    
    if not user:
        # Create a new user with Google details
        user_id = str(uuid.uuid4())
        # Google users won't use password, but model requires password_hash. We generate a dummy password hash
        dummy_pass = str(uuid.uuid4())
        hashed = hash_password(dummy_pass)
        
        user = UserModel(
            id=user_id,
            name=request.name,
            email=request.email,
            password_hash=hashed
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.put("/profile", response_model=UserResponse)
def update_profile(name: str, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    """Updates the display name of the currently authenticated user."""
    current_user.name = name
    db.commit()
    db.refresh(current_user)
    return current_user


