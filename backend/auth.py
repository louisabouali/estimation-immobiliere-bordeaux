import os, datetime, jwt
from passlib.hash import bcrypt
from flask import request

SECRET = os.getenv('SECRET_KEY', 'dev')

def hash_password(p):
return bcrypt.hash(p)

def verify_password(p, h):
return bcrypt.verify(p, h)

def create_jwt(user_id):
payload = {
'sub': user_id,
'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
}
return jwt.encode(payload, SECRET, algorithm='HS256')

def require_auth(fn):
def wrapper(*args, **kwargs):
token = request.headers.get('Authorization', '').replace('Bearer ','')
if not token:
return {'error': 'missing_token'}, 401
try:
jwt.decode(token, SECRET, algorithms=['HS256'])
except Exception:
return {'error': 'invalid_token'}, 401
return fn(*args, **kwargs)
wrapper.__name__ = fn.__name__
return wrapper