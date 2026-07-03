# Rhabit — Landing / lista de espera

Página web de presentación de la app **Rhabit** con captación de correos para avisar del lanzamiento. Diseño oscuro, profesional, con la mascota conejo y vídeos reales de la app en mockups 3D.

## Estructura

```
web/
├── index.html          # Página (hero con formulario + secciones)
├── styles.css          # Estilos
├── script.js           # Validación + hash del correo + envío al collector
├── assets/             # Mascota, icono y vídeos de la app
├── hashes.txt          # Hashes SHA-256 (seguro para repo pública)
├── collector/          # Backend que recoge los correos (para MÁS ADELANTE)
│   ├── server.py
│   └── requirements.txt
└── .gitignore          # Evita subir correos en claro
```

## Publicar en GitHub Pages

1. Sube esta carpeta a un repositorio.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Listo: la web funciona tal cual. Sin backend, los correos se guardan
   (por hash) en el `localStorage` del visitante y se muestra el mensaje de éxito.

## Conectar el envío de correos (más adelante)

El formulario ya está preparado. Cuando quieras recoger los correos de verdad:

1. **Despliega el collector** (`collector/server.py`) en cualquier host
   (Raspberry, Fly.io, Render, VPS…):
   ```bash
   pip install -r collector/requirements.txt
   python collector/server.py
   ```
   Guarda dos archivos en `collector/data/`:
   - `hashes.txt` → hashes (subible a la repo pública).
   - `emails.txt` → correos reales (**privado**, ya está en `.gitignore`).

2. **Apunta la web al collector**: en `script.js` pon la URL:
   ```js
   const COLLECTOR_URL = "https://tu-servidor/subscribe";
   ```

3. **Envío masivo con herramienta open source**: cuando la app salga, importa
   `emails.txt` en un mailer open source como **[Listmonk](https://listmonk.app)**
   (o Mautic / Keila) y envía el aviso de lanzamiento + los regalos.

## Privacidad

- El repo es público, por eso solo se versiona `hashes.txt` (SHA-256, irreversible).
- Los correos en claro solo viven en `collector/data/emails.txt`, que **nunca** se sube.
