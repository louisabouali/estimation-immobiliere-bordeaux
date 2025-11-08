import csv
from app import app, db
from models import Neighborhood

"""
Importe les prix moyens au m² dans la table Neighborhood
Depuis un CSV avec colonnes : quartier,prix_m2
"""

import sys
if len(sys.argv) < 2:
    print("Usage : python import_prices.py <fichier.csv>")
    sys.exit(1)

csv_file = sys.argv[1]

with app.app_context():
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["quartier"].strip()
            price = float(row["prix_m2"])

            # Chercher le quartier existant
            q = Neighborhood.query.filter_by(name=name).first()

            if q:
                q.avg_price_sqm = price
                print(f"✅ Mise à jour : {name} → {price} €/m²")
            else:
                # Si le quartier n’existe pas, on le crée
                print(f"➕ Nouveau quartier ajouté : {name} → {price} €/m²")
                q = Neighborhood(name=name, avg_price_sqm=price)
                db.session.add(q)

        db.session.commit()

print("\n🎉 Import terminé avec succès !")
