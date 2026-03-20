# Portfolio Reflection

Afegeix una reflexio personal (tipus "note") al portafoli.

## Flux de treball

### 1. Rebre i processar el text

L'usuari proporcionara un text aproximat en catala, probablement sense paragrafs ben definits. La teva feina:

1. **Llegir el text** i entendre la idea central
2. **Estructurar-lo en paragrafs** coherents amb salts de linia adequats
3. **Polir la redaccio**: corregir ortografia, millorar la fluidesa, pero **mantenint la veu i l'estil personal** de l'usuari — es un text d'opinio/reflexio, no un article tecnic. No el facis sonar artificialment formal ni li treguis personalitat
4. **Ampliar si escau**: si la idea es pot desenvolupar amb algun punt addicional rellevant, afegir-lo subtilment. Pero no inflar el text innecessariament
5. **Afegir estructura Markdown**: titol amb `#`, subtitols amb `##` si el text ho demana, **negretes** per emfasi, *cursives* per matisos

### 2. Proposar titol i resum

Genera:
- **Titol** (ca/es/en): Curt, evocador, que reflecteixi l'essencia de la reflexio. No ha de ser generic
- **shortDescription** (ca/es/en): 1-2 frases que enganxin i resumeixin la idea sense revelar-ho tot
- **ID**: kebab-case derivat del titol catala, curt i descriptiu

### 3. Traduir

Tradueix el text complet (fullDescription) a:
- **Espanyol (es)**: Traduccio natural, no literal. Adaptar expressions idiomatiques
- **Angles (en)**: Traduccio natural. Mantenir el to personal i directe

**Important**: Cada traduccio ha de sonar com si s'hagues escrit originalment en aquell idioma.

### 4. Determinar tags i relatedProjects

- **Tags**: Gairebe sempre sera `["reflection"]`. Si el tema ho justifica, afegir-ne d'altres dels existents al JSON
- **relatedProjects**: Si la reflexio menciona o es relaciona amb algun projecte del portafoli, incloure el seu ID. Si no, array buit `[]`

Per trobar IDs de projectes existents:
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data/projects.json','utf8')); d.projects.filter(p=>p.type==='project').forEach(p=>console.log(p.id+' — '+p.title.ca))"
```

### 5. Mostrar proposta a l'usuari

Abans de tocar res, mostra el text complet resultant en **catala** (no cal mostrar les 3 versions senceres) amb:

```
Proposta de reflexio
====================

ID: {id}
Titol: {titol en catala}
Tags: {tags}
Projectes relacionats: {ids o "cap"}

--- Descripcio curta ---
{shortDescription en catala}

--- Text complet ---
{fullDescription en catala, renderitzat com a markdown}
```

Espera que l'usuari confirmi, demani canvis o ajusti el text. Itera fins que estigui satisfet.

### 6. Inserir a projects.json

Un cop confirmat:

1. **Llegeix** `data/projects.json`
2. **Afegeix** la nova entrada al **principi** de l'array `projects`
3. **Escriu** el fitxer actualitzat

**Estructura de l'entrada:**

```json
{
  "id": "{id}",
  "type": "note",
  "visible": true,
  "featured": false,
  "date": "{YYYY-MM-DD d'avui}",
  "projectLanguages": ["ca", "es", "en"],
  "title": {
    "ca": "...",
    "es": "...",
    "en": "..."
  },
  "shortDescription": {
    "ca": "...",
    "es": "...",
    "en": "..."
  },
  "fullDescription": {
    "ca": "...",
    "es": "...",
    "en": "..."
  },
  "tags": ["reflection"],
  "images": [],
  "relatedProjects": []
}
```

**Notes importants sobre el JSON:**
- Les `fullDescription` contenen Markdown amb `\n` per als salts de linia
- Escapa correctament les cometes dins el text: `\"`
- No trenquis el JSON existent — fes servir Edit per inserir l'entrada, no reescriure tot el fitxer
- El metode mes segur: llegeix el JSON, parseja'l amb node, afegeix l'entrada, i escriu-lo formatat amb `JSON.stringify(data, null, 2)`

### 7. Verificacio

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data/projects.json','utf8')); const n=d.projects[0]; console.log('Entrada afegida:', n.id, '('+n.type+')'); console.log('  Titol:', n.title.ca); console.log('  Data:', n.date); console.log('  Tags:', n.tags.join(', '))"
```

### 8. Missatge final

Indica que la reflexio s'ha afegit correctament i que l'usuari pot:
- Revisar el resultat obrint el portafoli al navegador
- Fer `git add data/projects.json && git commit -m "Add reflection: {titol}" && git push`

## Directrius d'estil

- **Veu**: L'usuari escriu en primera persona, to directe, reflexiu, a vegades amb humor. Respecta-ho
- **No sobreescriure**: Si l'usuari diu alguna cosa d'una manera concreta, no la canviis perque si. Nomes ajusta si hi ha errors o si la claredat ho requereix
- **Longitud**: Les reflexions poden ser curtes (3-4 paragrafs) o llargues. No forcis una longitud determinada
- **Markdown**: Utilitza subtitols `##` per seccionar si el text es prou llarg (4+ paragrafs). Si es curt, amb el titol `#` n'hi ha prou
- **Idioma de comunicacio**: Catala
