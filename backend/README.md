# Backend de análisis (Fase 2 — aún no implementado)

Servicio ligero (Supabase Edge Function o Cloudflare Worker) que hace de
proxy entre la app y el modelo de visión. **La API key del modelo vive
solo aquí, nunca en el cliente.**

## Contrato con la app

`POST /analyze`

```jsonc
// Request (la app ya comprime a máx. 1024px y JPEG 0.7 — ver src/utils/image.ts)
{
  "scannerId": "condicion_corporal" | "etiqueta",
  "images": ["<jpeg base64>", "..."],
  "pet": { "nombre": "...", "raza": "...", "edadAnios": 4, "pesoKg": 12.5 }
}

// Response: exactamente el esquema validado en src/services/analysis/types.ts
{
  "tipo": "condicion_corporal",
  "puntuacion": 6,
  "categoria": "Sobrepeso",
  "titulo_resultado": "Le sobran unos kilitos",
  "explicacion": "...",
  "detalles": [{ "nombre": "...", "tipo": "positivo|negativo|neutro", "nota": "..." }],
  "recomendaciones": ["..."],
  "confianza": "alta|media|baja",
  "requiere_veterinario": false
}
```

## Proveedor de IA

Configurable por variable de entorno (`AI_PROVIDER=anthropic|openai`,
`AI_API_KEY=...`) para poder cambiar de proveedor sin tocar la app.
API de Anthropic: https://docs.claude.com/en/api/overview

## Reglas del system prompt (borrador)

```
Eres el motor de análisis de una app de salud para perros. Recibes fotos y
datos opcionales del perro (nombre, raza, edad, peso).

RESPONDE EXCLUSIVAMENTE CON JSON VÁLIDO según el esquema indicado, sin
texto adicional ni markdown.

Reglas:
- Español neutro, válido para España y Latinoamérica. Tono cercano pero serio.
- PROHIBIDO diagnosticar enfermedades, recetar medicamentos, dosis o dietas médicas.
- "recomendaciones": máximo 3, siempre generales (hábitos, raciones medidas,
  ejercicio, consultar al veterinario). Nunca médicas.
- Si la imagen no es válida (no se ve un perro completo / no se lee la
  etiqueta): confianza "baja", puntuación 0 y explicación pidiendo repetir
  la foto con instrucciones concretas.
- Si detectas algo preocupante (obesidad severa, delgadez extrema,
  ingrediente peligroso): requiere_veterinario = true.

Escáner "condicion_corporal": puntuacion = escala BCS 1-9.
Categorías: muy delgado (1-2) / delgado (3) / ideal (4-5) / sobrepeso (6-7) / obesidad (8-9).

Escáner "etiqueta": puntuacion = nota de calidad 0-100.
Categorías: excelente (80-100) / buena (60-79) / mejorable (40-59) / mala (0-39).
"detalles": los 3-5 ingredientes más relevantes (positivos y negativos), una frase cada uno.
```

## Pendiente al implementar

- Validar el JSON del modelo con el MISMO validador que el cliente
  (copiar/compartir `validateAnalysisResult`).
- No persistir imágenes: procesar y descartar (declarado en la política
  de privacidad y en los nutrition labels de App Store).
- Rate limiting básico por dispositivo (cabecera con app user id anónimo
  de RevenueCat) para proteger el coste de API.
