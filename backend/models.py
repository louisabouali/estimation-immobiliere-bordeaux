from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON as JSONB
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Neighborhood(db.Model):
    __tablename__ = 'neighborhoods'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(50))
    city = db.Column(db.String(120), default='Bordeaux')
    geom_geojson = db.Column(JSONB)                 # JSON compatible SQLite
    avg_price_sqm = db.Column(db.Numeric(12, 2))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class DPECoefficient(db.Model):
    __tablename__ = 'dpe_coefficients'
    id = db.Column(db.Integer, primary_key=True)
    grade = db.Column(db.String(1), unique=True, nullable=False)
    factor = db.Column(db.Numeric(5, 3), nullable=False)

class Estimate(db.Model):
    __tablename__ = 'estimates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    neighborhood_id = db.Column(db.Integer, db.ForeignKey('neighborhoods.id'))
    property_type = db.Column(db.String(20), nullable=False)
    surface = db.Column(db.Numeric(8, 2), nullable=False)
    rooms = db.Column(db.Integer)
    dpe_grade = db.Column(db.String(1))
    floor = db.Column(db.Integer)
    year_built = db.Column(db.Integer)
    condition = db.Column(db.String(20))
    balcony = db.Column(db.Boolean)
    parking = db.Column(db.Boolean)
    orientation = db.Column(db.String(10))
    noise_level = db.Column(db.String(10))
    transport_score = db.Column(db.Numeric(4, 2))
    amenities_score = db.Column(db.Numeric(4, 2))
    estimated_price = db.Column(db.Numeric(14, 2), nullable=False)
    details = db.Column(JSONB)                       # JSON compatible SQLite
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PriceHistory(db.Model):
    __tablename__ = 'price_history'
    id = db.Column(db.Integer, primary_key=True)
    neighborhood_id = db.Column(db.Integer, db.ForeignKey('neighborhoods.id'))
    observed_at = db.Column(db.Date, nullable=False)
    avg_price_sqm = db.Column(db.Numeric(12, 2), nullable=False)
