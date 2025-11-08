from decimal import Decimal
from models import Neighborhood, DPECoefficient

WEIGHTS = {
    'surface_size': {'small': 1.05, 'medium': 1.00, 'large': 0.97},
    'condition': {'neuf': 1.10, 'bon': 1.00, 'a_renover': 0.90},
    'floor': {'ground': 0.98, 'mid': 1.00, 'high': 1.02},
    'orientation': {'S': 1.02, 'E': 1.01, 'O': 1.00, 'N': 0.99},
    'noise': {'bas': 1.01, 'moyen': 1.00, 'eleve': 0.97},
    'amenities': 0.01,
    'transport': 0.01,
    'balcony': 1.02,
    'parking': 1.03
}

def _size_bucket(surface: float) -> str:
    s = float(surface)
    if s < 30: return 'small'
    if s <= 80: return 'medium'
    return 'large'

def estimate_price(
    db_session,
    neighborhood_id,
    surface,
    dpe_grade='D',
    property_type='appartement',
    condition='bon',
    floor=2,
    year_built=None,
    rooms=None,
    balcony=False,
    parking=False,
    orientation='E',
    noise_level='moyen',
    transport_score=5,
    amenities_score=5
):
    n = db_session.get(Neighborhood, int(neighborhood_id))
    if not n or not n.avg_price_sqm:
        raise ValueError('Quartier inconnu ou sans prix moyen au m²')
    base = Decimal(str(n.avg_price_sqm))

    dpe_row = db_session.query(DPECoefficient).filter_by(grade=(dpe_grade or 'D').upper()).first()
    dpe = Decimal(str(dpe_row.factor)) if dpe_row else Decimal('1.00')

    size_factor = Decimal(str(WEIGHTS['surface_size'][_size_bucket(surface)]))
    cond_factor = Decimal(str(WEIGHTS['condition'].get((condition or 'bon').lower(), 1.0)))

    try: f = int(floor if floor is not None else 2)
    except: f = 2
    floor_factor = (Decimal(str(WEIGHTS['floor']['ground'])) if f <= 0 else
                    Decimal(str(WEIGHTS['floor']['high'])) if f >= 5 else
                    Decimal(str(WEIGHTS['floor']['mid'])))

    orient_factor = Decimal(str(WEIGHTS['orientation'].get((orientation or 'E').upper(), 1.0)))
    noise_factor  = Decimal(str(WEIGHTS['noise'].get((noise_level or 'moyen').lower(), 1.0)))

    try: amen = max(0, min(float(amenities_score if amenities_score is not None else 5), 10))
    except: amen = 5.0
    try: transp = max(0, min(float(transport_score if transport_score is not None else 5), 10))
    except: transp = 5.0
    amen_factor   = Decimal('1.00') + Decimal(str(WEIGHTS['amenities'])) * Decimal(str(amen))
    transp_factor = Decimal('1.00') + Decimal(str(WEIGHTS['transport'])) * Decimal(str(transp))

    balcony_factor = Decimal(str(WEIGHTS['balcony'])) if bool(balcony) else Decimal('1.00')
    parking_factor = Decimal(str(WEIGHTS['parking'])) if bool(parking) else Decimal('1.00')

    price_sqm = base * dpe * size_factor * cond_factor * floor_factor * orient_factor * noise_factor * amen_factor * transp_factor
    total_price = price_sqm * Decimal(str(surface)) * balcony_factor * parking_factor

    details = {
        'base_sqm': float(base),
        'dpe_factor': float(dpe),
        'size_factor': float(size_factor),
        'condition_factor': float(cond_factor),
        'floor_factor': float(floor_factor),
        'orientation_factor': float(orient_factor),
        'noise_factor': float(noise_factor),
        'amenities_factor': float(amen_factor),
        'transport_factor': float(transp_factor),
        'balcony_factor': float(balcony_factor),
        'parking_factor': float(parking_factor),
        'price_sqm': float(price_sqm)
    }
    return total_price.quantize(Decimal('1.')), details
