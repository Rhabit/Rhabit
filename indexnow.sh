#!/usr/bin/env bash
# Notifica a IndexNow (Bing, Yandex, etc.) que estas URLs se han creado o
# actualizado, para un re-rastreo inmediato. Ejecuta: bash indexnow.sh
KEY="cb7d0fe007ee60c81f22efc719b536a1"
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "rhabit.app",
    "key": "'"$KEY"'",
    "keyLocation": "https://rhabit.app/'"$KEY"'.txt",
    "urlList": [
      "https://rhabit.app/",
      "https://rhabit.app/donar.html"
    ]
  }'
echo
