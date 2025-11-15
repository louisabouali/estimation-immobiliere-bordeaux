from flask import Blueprint, request, jsonify
from models import db, User, Neighborhood, Estimate, DPECoefficient
from passlib.hash import bcrypt
import jwt, os
from models import db, User, Neighborhood, Estimate, DPECoefficient, ContactMessage


api = Blueprint('api', __name__)

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "email_et_mot_de_passe_requis"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email_existant"}), 409
    user = User(email=email, password_hash=bcrypt.hash(password))
    db.session.add(user)
    db.session.commit()
    token = jwt.encode({"user_id": user.id}, os.getenv("SECRET_KEY", "dev"), algorithm="HS256")
    return jsonify({"token": token, "user_id": user.id})

@api.route('/neighborhoods', methods=['GET'])
def get_neighborhoods():
    items = Neighborhood.query.order_by(Neighborhood.name).all()
    return jsonify([{"id": n.id, "name": n.name, "avg_price_sqm": float(n.avg_price_sqm or 0)} for n in items])

@api.route('/estimate', methods=['POST'])
def estimate():
    from estimator import estimate_price  # import local pour éviter les cycles
    data = request.json or {}

    neighborhood_id = int(data.get("neighborhood_id"))
    surface = float(data.get("surface", 0))
    dpe_grade = (data.get("dpe_grade") or "D").upper()

    # Calcul complet via estimator (coeffs: état, étage, balcon, parking, orientation, bruit, scores…)
    total, details = estimate_price(
        db.session,
        neighborhood_id=neighborhood_id,
        surface=surface,
        dpe_grade=dpe_grade,
        property_type=data.get("property_type", "appartement"),
        condition=data.get("condition", "bon"),
        floor=data.get("floor"),
        year_built=data.get("year_built"),
        rooms=data.get("rooms"),
        balcony=bool(data.get("balcony")),
        parking=bool(data.get("parking")),
        orientation=data.get("orientation"),
        noise_level=data.get("noise_level"),
        transport_score=data.get("transport_score"),
        amenities_score=data.get("amenities_score"),
    )

    est = Estimate(
        user_id=data.get("user_id"),
        neighborhood_id=neighborhood_id,
        property_type=data.get("property_type", "appartement"),
        surface=surface,
        rooms=data.get("rooms"),
        dpe_grade=dpe_grade,
        floor=data.get("floor"),
        year_built=data.get("year_built"),
        condition=data.get("condition"),
        balcony=bool(data.get("balcony")),
        parking=bool(data.get("parking")),
        orientation=data.get("orientation"),
        noise_level=data.get("noise_level"),
        transport_score=data.get("transport_score"),
        amenities_score=data.get("amenities_score"),
        estimated_price=total,
        details=details
    )
    db.session.add(est)
    db.session.commit()

    return jsonify({"id": est.id, "estimated_price": round(float(total), 2), "details": details})


@api.route('/history/<int:user_id>', methods=['GET'])
def history(user_id):
    rows = Estimate.query.filter_by(user_id=user_id).order_by(Estimate.created_at.desc()).limit(100).all()
    return jsonify([{
        "id": r.id,
        "created_at": r.created_at.isoformat(),
        "neighborhood_id": r.neighborhood_id,
        "surface": float(r.surface),
        "dpe_grade": r.dpe_grade,
        "estimated_price": float(r.estimated_price)
    } for r in rows])

@api.route('/contact', methods=['POST'])
def contact():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()
    phone = (data.get('phone') or '').strip()
    subject = (data.get('subject') or '').strip()

    if not name or not email or not message:
        return jsonify({"error": "name_email_message_requis"}), 400

    cm = ContactMessage(name=name, email=email, phone=phone, subject=subject, message=message)
    db.session.add(cm)
    db.session.commit()
    return jsonify({"status": "ok", "id": cm.id})

