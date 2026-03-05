# Portfolio Evolution: De catálogo de proyectos a espacio personal orgánico

## Contexto y motivación

Este documento resume una conversación estratégica sobre cómo evolucionar el portfolio actual (`aaronfortuno.github.io/portfolio/`) para que deje de ser un escaparate técnico aséptico y se convierta en un **espacio personal con alma** que pueda, a medio plazo, generar una pequeña fuente de ingresos recurrente.

### Quién soy

Profesor que programa y crea herramientas educativas (juegos, experimentos, apps, MVPs). Todo lo que hago se publica con **licencias abiertas** y código fuente disponible. Uso IA (Claude, Claude Code) como herramienta de desarrollo, lo que me permite llevar ideas al mundo real rápidamente. Soy creativo pero caótico: salto de proyecto en proyecto, y cualquier sistema que requiera disciplina de publicación o fricción técnica acaba abandonado.

### El problema

- Las apps que creo están desconectadas entre sí, resuelven problemas puntuales de aula.
- El portfolio actual solo muestra fichas técnicas de proyecto, sin contexto humano ni pedagógico.
- Quiero poder monetizar mínimamente (al menos cubrir suscripciones), pero rechazo publicidad, suscripciones manipulativas y modelos de engagement tóxicos.
- Ya tengo un sistema de microdonaciones Lightning Network (`ln-tip-jar`), pero falta contexto para que la gente entienda el valor de lo que se ofrece.

### La visión

Transformar el portfolio en un **"jardín digital"**: un espacio que combine proyectos con reflexiones, experiencias de aula y notas personales, todo intercalado cronológicamente en un feed orgánico. El valor diferencial no está en el código (que es abierto) sino en el **criterio pedagógico, la curación y el contexto de uso real**.

### Modelo de monetización (capas)

1. **Todo abierto y gratuito** — filosofía V4V (valor por valor)
2. **Donaciones Lightning** contextualizadas — que se vea el volumen de trabajo y la filosofía detrás
3. **Futuro (no implementar ahora)**: packs didácticos descargables (app + ficha pedagógica + sugerencia de actividad) en Gumroad o similar, por precio simbólico o "paga lo que quieras"

---

## Cambios técnicos necesarios

### Estado actual

El portfolio es un sitio estático vanilla (HTML5 + CSS3 + JS), sin build step, desplegado en GitHub Pages con GitHub Actions. Los proyectos se almacenan en un único `data/projects.json` y se renderizan como tarjetas con carrusel de imágenes, filtros por tags e idioma, y modal de detalle con soporte Markdown.

### Objetivo

Añadir un segundo tipo de contenido: **notas/reflexiones** (`note`), que se intercalen cronológicamente con los proyectos en el mismo feed. No son secciones separadas: es un flujo único ordenado por fecha donde coexisten fichas de proyecto y entradas de texto.

### Nuevo esquema JSON

Añadir un campo `"type"` a cada entrada. Las entradas existentes son `"project"`. Las nuevas son `"note"`.

#### Entrada tipo `project` (sin cambios funcionales, solo añadir `type`)

```json
{
  "type": "project",
  "id": "caicul",
  "visible": true,
  "featured": false,
  "date": "2026-03-03",
  "projectLanguages": ["ca", "es", "en"],
  "title": { "ca": "...", "es": "...", "en": "..." },
  "shortDescription": { "ca": "...", "es": "...", "en": "..." },
  "fullDescription": { "ca": "# Markdown...", "es": "...", "en": "..." },
  "tags": ["web", "education"],
  "images": ["projects/caicul/img/caicul-01.webp"],
  "links": { "github": "...", "demo": "...", "docs": null }
}
```

#### Entrada tipo `note` (nueva)

```json
{
  "type": "note",
  "id": "reflexio-caicul-aula",
  "visible": true,
  "featured": false,
  "date": "2026-03-05",
  "projectLanguages": ["ca"],
  "title": {
    "ca": "Primer dia amb cAIcul a l'aula",
    "es": "Primer día con cAIcul en el aula",
    "en": "First day with cAIcul in the classroom"
  },
  "shortDescription": {
    "ca": "Com va anar la primera sessió utilitzant cAIcul amb alumnes de 1r d'ESO. Sorpreses, problemes i idees per millorar.",
    "es": "Cómo fue la primera sesión usando cAIcul con alumnos de 1º de ESO. Sorpresas, problemas e ideas para mejorar.",
    "en": "How the first session using cAIcul with 7th graders went. Surprises, issues and ideas for improvement."
  },
  "fullDescription": {
    "ca": "# Primer dia amb cAIcul a l'aula\n\nAvui he provat cAIcul amb el grup de 1r A...",
    "es": "# Primer día con cAIcul en el aula\n\nHoy he probado cAIcul con el grupo de 1º A...",
    "en": "# First day with cAIcul in the classroom\n\nToday I tested cAIcul with the 7th grade A group..."
  },
  "tags": ["education", "reflection"],
  "relatedProjects": ["caicul"],
  "images": []
}
```

**Campos específicos de `note`:**
- `relatedProjects` (array, opcional): IDs de proyectos relacionados. Permite mostrar un enlace "Ver proyecto" en la tarjeta de la nota.
- No tiene `links` (github/demo/docs).
- `images` puede estar vacío o contener alguna captura/foto opcional.

**Campos compartidos con `project`:**
- `type`, `id`, `visible`, `featured`, `date`, `projectLanguages`, `title`, `shortDescription`, `fullDescription`, `tags`, `images`

### Nuevo tag: `reflection`

Añadir al objeto `tags` del JSON:

```json
"reflection": {
  "ca": "Reflexió",
  "es": "Reflexión",
  "en": "Reflection"
}
```

### Cambios en el renderizado

1. **Feed unificado**: el array `projects` pasa a contener tanto proyectos como notas, mezclados. El orden cronológico y el sistema de featured siguen funcionando igual.

2. **Tarjeta de nota**: visualmente distinta de la tarjeta de proyecto, pero integrada en el mismo grid. Sugerencias:
   - Sin carrusel de imágenes (o con imagen opcional si la tiene).
   - Icono o indicador visual que la distinga (un icono de "nota" o "pluma", o un borde/acento de color diferente).
   - El `shortDescription` se muestra directamente como texto prominente en la tarjeta, dado que es el contenido principal.
   - Si tiene `relatedProjects`, mostrar un chip/enlace discreto al proyecto relacionado.
   - Al hacer clic, abre el mismo modal de detalle pero sin la sección de enlaces github/demo/docs (o solo mostrando enlaces a proyectos relacionados).

3. **Filtros**: el tag `reflection` permite filtrar para ver solo notas o excluirlas. El sistema de filtrado por tags existente debería funcionar sin cambios significativos.

4. **Retrocompatibilidad**: si una entrada no tiene `"type"`, asumir `"project"` por defecto, para que el JSON actual siga funcionando sin modificar las entradas existentes.

### Cambios en la UI general

1. **Sección "Sobre mi" / "Qui sóc"**: añadir una página o sección (puede ser un modal, una página aparte, o una sección colapsable en el header) con un texto breve que explique quién soy, por qué hago lo que hago, y la filosofía V4V/open source. No es un CV, es un par de párrafos con personalidad.

2. **Mensaje V4V visible**: en algún lugar prominente del sitio (footer, sección "sobre mi", o ambos), un mensaje claro tipo: "Tot el que trobaràs aquí és gratuït i de codi obert. Si et resulta útil, pots ajudar-me convidant-me a un cafè ⚡". Con el botón Lightning integrado.

3. **Textos i18n**: los nuevos textos de UI (etiquetas como "Nota", "Projectes relacionats", el mensaje V4V, la sección "Qui sóc") necesitan traducciones en los tres idiomas (ca, es, en).

---

## Prioridades de implementación

### Fase 1 (mínima, hacer ahora) ✅
- [x] Añadir campo `type` al esquema (con fallback a `"project"`)
- [x] Añadir tag `reflection` al JSON
- [x] Crear componente de tarjeta para notas
- [x] Hacer que el renderizador distinga entre `project` y `note`
- [x] Asegurar que el modal de detalle funcione para ambos tipos
- [x] Actualizar filtros para incluir el nuevo tag

### Fase 2 (darle alma, siguiente iteración) ✅
- [x] Sección "Qui sóc" con filosofía personal y V4V
- [x] Mensaje de donaciones Lightning más prominente y contextualizado
- [x] Campo `relatedProjects` funcional con enlaces cruzados
- [x] Actualizar el skill de Claude Code para generar fichas de tipo `note`

### Fase 3 (futuro, no urgente)
- [ ] Valorar migración a Jekyll/Hugo si el JSON crece demasiado
- [ ] Packs didácticos descargables
- [ ] Redirección de aaronfortuno.com al portfolio de GitHub

---

## Notas para Claude Code

- El proyecto usa **vanilla JS puro**, sin frameworks ni build step. Mantener esta filosofía.
- Los estilos están en `assets/css/`. Buscar allí los estilos de tarjetas existentes para crear las variantes de nota.
- La lógica de renderizado está en `assets/js/`. Buscar el renderer de tarjetas para añadir el condicional por `type`.
- El panel de admin (`admin/index.html`) debería actualizarse para soportar crear entradas de tipo nota, pero esto es secundario respecto a que el renderizado funcione.
- Respetar el sistema i18n existente (archivos en `i18n/`).
- **No romper nada existente**: las entradas de proyecto actuales deben seguir funcionando exactamente igual.
