---
name: portfolio-reflection
description: >
  Afegeix una nova reflexió (nota) al portafoli. L'usuari proporciona el text aproximat en català
  i la skill el poleix, estructura en paràgrafs, el tradueix a espanyol i anglès, i crea l'entrada
  a projects.json. Utilitza quan l'usuari vulgui publicar una reflexió o nota personal.
user-invocable: true
argument-hint: <text aproximat de la reflexió>
allowed-tools: Read, Edit, Bash, Glob, Grep
---

# Portfolio Reflection

Afegeix una reflexió personal (tipus "note") al portafoli.

## Flux de treball

### 1. Rebre i processar el text

L'usuari proporcionarà a `$ARGUMENTS` un text aproximat en català, probablement sense paràgrafs ben definits (escrit des del terminal). La teva feina:

1. **Llegir el text** i entendre la idea central
2. **Estructurar-lo en paràgrafs** coherents amb salts de línia adequats
3. **Polir la redacció**: corregir ortografia, millorar la fluïdesa, però **mantenint la veu i l'estil personal** de l'usuari — és un text d'opinió/reflexió, no un article tècnic. No el facis sonar artificialment formal ni li treguis personalitat
4. **Ampliar si escau**: si la idea es pot desenvolupar amb algun punt addicional rellevant, afegir-lo subtilment. Però no inflar el text innecessàriament
5. **Afegir estructura Markdown**: títol amb `#`, subtítols amb `##` si el text ho demana, **negretes** per èmfasi, *cursives* per matisos

### 2. Proposar títol i resum

Genera:
- **Títol** (ca/es/en): Curt, evocador, que reflecteixi l'essència de la reflexió. No ha de ser genèric
- **shortDescription** (ca/es/en): 1-2 frases que enganxin i resumeixin la idea sense revelar-ho tot
- **ID**: kebab-case derivat del títol català, curt i descriptiu

### 3. Traduir

Tradueix el text complet (fullDescription) a:
- **Espanyol (es)**: Traducció natural, no literal. Adaptar expressions idiomàtiques
- **Anglès (en)**: Traducció natural. Mantenir el to personal i directe

**Important**: Cada traducció ha de sonar com si s'hagués escrit originalment en aquell idioma.

### 4. Determinar tags i relatedProjects

- **Tags**: Gairebé sempre serà `["reflection"]`. Si el tema ho justifica, afegir-ne d'altres dels existents al JSON
- **relatedProjects**: Si la reflexió menciona o es relaciona amb algun projecte del portafoli, incloure el seu ID. Si no, array buit `[]`

Per trobar IDs de projectes existents:
```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data/projects.json','utf8')); d.projects.filter(p=>p.type==='project').forEach(p=>console.log(p.id+' — '+p.title.ca))"
```

### 5. Mostrar proposta a l'usuari

Abans de tocar res, mostra el text complet resultant en **català** (no cal mostrar les 3 versions senceres) amb:

```
📝 Proposta de reflexió
━━━━━━━━━━━━━━━━━━━━━

ID: {id}
Títol: {títol en català}
Tags: {tags}
Projectes relacionats: {ids o "cap"}

--- Descripció curta ---
{shortDescription en català}

--- Text complet ---
{fullDescription en català, renderitzat com a markdown}
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
- Les `fullDescription` contenen Markdown amb `\n` per als salts de línia
- Escapa correctament les cometes dins el text: `\"`
- No trenquis el JSON existent — fes servir `Edit` per inserir l'entrada, no reescriure tot el fitxer
- El mètode més segur: llegeix el JSON, parseja'l amb node, afegeix l'entrada, i escriu-lo formatat amb `JSON.stringify(data, null, 2)`

### 7. Verificació

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data/projects.json','utf8')); const n=d.projects[0]; console.log('✓ Entrada afegida:', n.id, '('+n.type+')'); console.log('  Títol:', n.title.ca); console.log('  Data:', n.date); console.log('  Tags:', n.tags.join(', '))"
```

### 8. Missatge final

Indica que la reflexió s'ha afegit correctament i que l'usuari pot:
- Revisar el resultat obrint el portafoli al navegador
- Fer `git add data/projects.json && git commit -m "Add reflection: {títol}" && git push`

## Directrius d'estil

- **Veu**: L'usuari escriu en primera persona, to directe, reflexiu, a vegades amb humor. Respecta-ho
- **No sobreescriure**: Si l'usuari diu alguna cosa d'una manera concreta, no la canviïs perquè sí. Només ajusta si hi ha errors o si la claredat ho requereix
- **Longitud**: Les reflexions poden ser curtes (3-4 paràgrafs) o llargues. No forcis una longitud determinada
- **Markdown**: Utilitza subtítols `##` per seccionar si el text és prou llarg (4+ paràgrafs). Si és curt, amb el títol `#` n'hi ha prou
- **Idioma de comunicació**: Català
