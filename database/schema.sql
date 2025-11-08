-- Utilisateurs
CREATE TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

-- Quartiers de Bordeaux (codes INSEE/ban, géo, etc.)
CREATE TABLE neighborhoods (
id SERIAL PRIMARY KEY,
name VARCHAR(120) NOT NULL,
code VARCHAR(50),
city VARCHAR(120) DEFAULT 'Bordeaux',
geom_geojson JSONB, -- optionnel: polygone
avg_price_sqm NUMERIC(12,2), -- prix moyen à m² (base)
updated_at TIMESTAMP DEFAULT NOW()
);

-- Coefficients DPE (ajustement multiplicatif)
CREATE TABLE dpe_coefficients (
id SERIAL PRIMARY KEY,
grade CHAR(1) UNIQUE NOT NULL CHECK (grade IN ('A','B','C','D','E','F','G')),
factor NUMERIC(5,3) NOT NULL -- ex: A=1.05, G=0.88
);

-- Estimations enregistrées
CREATE TABLE estimates (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id) ON DELETE SET NULL,
neighborhood_id INT REFERENCES neighborhoods(id),
property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('appartement','maison')),
surface NUMERIC(8,2) NOT NULL,
rooms INT,
dpe_grade CHAR(1) CHECK (dpe_grade IN ('A','B','C','D','E','F','G')),
floor INT, -- étage
year_built INT,
condition VARCHAR(20), -- état (neuf, bon, à rénover)
balcony BOOLEAN,
parking BOOLEAN,
orientation VARCHAR(10), -- N, S, E, O
noise_level VARCHAR(10), -- bas, moyen, élevé
transport_score NUMERIC(4,2), -- proximité tram/bus
amenities_score NUMERIC(4,2), -- commerces, écoles
estimated_price NUMERIC(14,2) NOT NULL,
details JSONB, -- log des facteurs utilisés
created_at TIMESTAMP DEFAULT NOW()
);

-- Historique des prix par quartier (pour graphiques et suivi)
CREATE TABLE price_history (
id SERIAL PRIMARY KEY,
neighborhood_id INT REFERENCES neighborhoods(id),
observed_at DATE NOT NULL,
avg_price_sqm NUMERIC(12,2) NOT NULL
);