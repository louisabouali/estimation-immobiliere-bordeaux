import os
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

db.init_app(app)

app.register_blueprint(api, url_prefix='/api')

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5001)), debug=True)

