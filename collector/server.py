#!/usr/bin/env python3
"""
Rhabit — collector de correos para la lista de espera.

Recibe los envíos del formulario de la web y los guarda:
  - hashes.txt   -> hash SHA-256 de cada correo (se puede subir a la repo pública)
  - emails.txt   -> correo real en claro (NUNCA subir a la repo; para enviar el aviso)

El envío masivo se hará MÁS ADELANTE con una herramienta open source
(p. ej. Listmonk). Este script solo recoge y deduplica.

Uso:
    pip install flask flask-cors
    python server.py
    # luego pon la URL pública de este servicio en COLLECTOR_URL (script.js)
"""

import hashlib
import json
import os
import threading
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # permite peticiones desde la web (GitHub Pages)

DATA_DIR   = os.path.join(os.path.dirname(__file__), "data")
HASH_FILE  = os.path.join(DATA_DIR, "hashes.txt")   # público-safe
EMAIL_FILE = os.path.join(DATA_DIR, "emails.txt")   # PRIVADO
os.makedirs(DATA_DIR, exist_ok=True)

_lock = threading.Lock()


def _load_hashes() -> set:
    if not os.path.exists(HASH_FILE):
        return set()
    with open(HASH_FILE, "r", encoding="utf-8") as f:
        return {line.split("\t")[0].strip() for line in f if line.strip()}


@app.post("/subscribe")
def subscribe():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if "@" not in email or "." not in email:
        return jsonify(ok=False, error="invalid_email"), 400

    # Recalculamos el hash en el servidor (no confiamos en el del cliente)
    digest = hashlib.sha256(email.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc).isoformat()

    with _lock:
        if digest in _load_hashes():
            return jsonify(ok=True, duplicate=True)

        # hashes.txt : "<hash>\t<fecha>"  (subible a repo pública)
        with open(HASH_FILE, "a", encoding="utf-8") as f:
            f.write(f"{digest}\t{now}\n")

        # emails.txt : correo real, para poder enviar el aviso (mantener privado)
        with open(EMAIL_FILE, "a", encoding="utf-8") as f:
            f.write(f"{email}\t{now}\n")

    return jsonify(ok=True, duplicate=False)


@app.get("/health")
def health():
    return jsonify(ok=True, count=len(_load_hashes()))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
