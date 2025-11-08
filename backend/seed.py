from app import app, db
from models import Neighborhood, DPECoefficient

with app.app_context():
    # Insérer les quartiers si la table est vide
    if Neighborhood.query.count() == 0:
        db.session.add_all([
            Neighborhood(name='Chartrons', code='CH', avg_price_sqm=6000),
            Neighborhood(name='Saint-Michel', code='SM', avg_price_sqm=4900),
            Neighborhood(name='Caudéran', code='CA', avg_price_sqm=5200),
            Neighborhood(name='Bastide', code='BA', avg_price_sqm=4700),
        ])

    # Insérer les coefficients DPE si la table est vide
    if DPECoefficient.query.count() == 0:
        db.session.add_all([
            DPECoefficient(grade='A', factor=1.060),
            DPECoefficient(grade='B', factor=1.030),
            DPECoefficient(grade='C', factor=1.010),
            DPECoefficient(grade='D', factor=1.000),
            DPECoefficient(grade='E', factor=0.970),
            DPECoefficient(grade='F', factor=0.930),
            DPECoefficient(grade='G', factor=0.880),
        ])

    db.session.commit()
    print('Seed done')
