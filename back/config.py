import os
from dotenv import load_dotenv

load_dotenv() 

class Config:
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/garciatec')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3001,http://127.0.0.1:3001').split(',')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')