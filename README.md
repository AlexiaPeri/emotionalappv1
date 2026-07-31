# Emerge: Let it out

**Prototype web d'une future app iPhone de libération émotionnelle guidée par la voix**

Quand tu as un trop-plein d'émotions — au lieu de scroller — tu ouvres Emerge, tu nommes simplement ce que tu ressens et l'app te le répète. Cette boucle vocale aide à rester au contact du ressenti plutôt que de repartir dans l'analyse.

---

## Ce que c'est

Emerge est une pratique de libération émotionnelle inspirée de la répétition de Meisner et centrée sur l'utilisateur. L'utilisateur met son ressenti en mots avec une phrase simple. L'app capte cette phrase, transforme localement les pronoms quand nécessaire (`je → tu`, `I → you`), puis la répète avec une voix calme.

Pendant la pratique, il n'y a ni analyse ni conseils : seulement les mots de l'utilisateur, retournés vers lui par une voix calme. Une réflexion écrite facultative est proposée après la session.

### Hypothèse produit

Emerge rassemble plusieurs mécanismes étudiés séparément : mettre les émotions en mots, rester au contact de l'expérience ressentie et inviter le corps à bouger. La répétition vocale est le mécanisme distinctif du produit : elle est conçue pour soutenir l'attention sans ajouter d'analyse. Son effet propre devra être évalué pendant les tests utilisateurs ; il n'est pas présenté comme cliniquement démontré.

### Positionnement

**L'alternative au scrolling.** Quand une émotion forte arrive, le réflexe c'est d'ouvrir Instagram. Emerge est là pour être l'autre option — accessible en 1 tap, immédiat, sans effort cognitif.

---

## Fonctionnement du prototype web actuel

```
Utilisateur parle
       ↓
Speech Recognition (Web Speech API, Chrome)
       ↓
Swap de pronoms (FR: je→tu / EN: I→you)
       ↓
ElevenLabs TTS (voix naturelle)
       ↓
L'app répète vocalement
```

**Pas de texte affiché pendant la session.** L'expérience de pratique reste vocale.

---

## Stack du prototype web

- **Frontend** : HTML / CSS / JS vanilla (zéro dépendance)
- **Core portable** : copy, presets de voix, transformation de texte
- **Pages** : accueil, pratique, FAQ, contact
- **Reconnaissance vocale** : Web Speech API (Chrome uniquement)
- **TTS** : ElevenLabs API (`eleven_turbo_v2_5`) + fallback voix navigateur
- **Hébergement** : GitHub Pages
- **Clé API** : stockée en localStorage côté client, jamais en dur dans le code

Cette stack sert à tester les parcours et le design. Elle n'est pas l'architecture vocale prévue pour l'app iPhone finale.

---

## Cible iPhone

L'app finale doit être native, construite avec SwiftUI. Son architecture vocale cible est :

```
Microphone iPhone
       ↓
Apple SpeechAnalyzer ou Deepgram Flux
       ↓
Transformation locale et déterministe des pronoms
       ↓
AVSpeechSynthesizer avec une voix iPhone
       ↓
L'app répète la phrase
```

- **Reconnaissance vocale** : comparer Apple SpeechAnalyzer et Deepgram Flux dans deux prototypes natifs identiques avant de choisir.
- **Répétition** : utiliser les voix Enhanced ou Premium disponibles sur l'iPhone.
- **Guidances** : utiliser les fichiers audio préenregistrés avec la voix d'Alexia.
- **Transformation des pronoms** : rester locale et déterministe ; ne pas utiliser de LLM susceptible de reformuler l'émotion.
- **Fiabilité** : gérer explicitement les états écoute → transformation → répétition → reprise, les interruptions audio et le redémarrage automatique.
- **Confidentialité** : privilégier le traitement local. Si Deepgram est retenu, ne jamais embarquer sa clé dans l'app ; utiliser des jetons temporaires délivrés par un backend.

La décision détaillée et le protocole de comparaison sont documentés dans [docs/ios-voice-strategy.md](docs/ios-voice-strategy.md).

### Compatibilité de la bêta

- **Appareil minimum visé** : iPhone 15.
- **Système minimum visé** : iOS 26.
- **Langues initiales** : français et anglais.
- **Connexion internet** : requise pendant la première bêta afin de conserver Deepgram comme candidat ou solution de repli.
- **Contrôle au démarrage** : vérifier `SpeechTranscriber.isAvailable` et la présence de la locale FR ou EN avant d'activer Apple SpeechAnalyzer.
- **Échantillon alpha minimum** : un iPhone 15/15 Plus, un iPhone 15 Pro/Pro Max et un iPhone 16 ou plus récent.

---

## Structure

```
.
├── index.html          ← Point d'entrée
├── site/               ← Site public de présentation d'Emerge
├── writing.html        ← Studio privé de rédaction et d'export des textes
├── css/
│   └── styles.css      ← Thème terracotta
├── js/
│   ├── app-config.js   ← Copy, presets de voix, clés
│   ├── pronouns.js     ← Conversion FR / EN portable
│   └── app.js          ← Shell web + voix navigateur
├── docs/
│   └── content-inventory.md ← Inventaire éditorial
└── README.md
```

### Studio d'écriture

Ouvrir `http://127.0.0.1:5173/writing.html` lorsque le serveur Vite est lancé.

- 26 ensembles de textes organisés par priorité.
- Versions française et anglaise indépendantes.
- Objectif éditorial et questions de réflexion pour chaque texte.
- Sauvegarde automatique dans le navigateur.
- Statuts `À écrire`, `À revoir`, `Brouillon` et `Validé`.
- Export complet en Markdown.

Les brouillons ne sont pas envoyés vers un serveur et ne modifient pas automatiquement le code de l'app. Utiliser régulièrement le bouton `Exporter` pour conserver une copie en dehors du navigateur.

### Site public Emerge

Ouvrir `http://127.0.0.1:5173/site/` lorsque le serveur Vite est lancé.

Le site public présente le besoin, la boucle vocale, l'expérience, les fondements scientifiques et la vision du produit. Il reste distinct du prototype et ne présente pas les mécanismes étudiés comme une preuve d'efficacité de l'app. La stratégie éditoriale et les sources sont documentées dans [docs/marketing-site-strategy.md](docs/marketing-site-strategy.md).

---

## Lancer en local

### Option Live Server (recommandé)

1. Ouvre le dossier dans VS Code
2. Clic droit sur `index.html` → **Open with Live Server**
3. Chrome s'ouvre sur `http://127.0.0.1:5500`
4. Entre ta clé ElevenLabs dans ⚙️ (une seule fois, sauvegardée)

### Option terminal

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

> ⚠️ Ne pas ouvrir `index.html` directement en `file://` — les modules JS sont bloqués par le navigateur.

---

## Configuration ElevenLabs

- Clé gratuite sur [elevenlabs.io](https://elevenlabs.io) — 10 000 caractères/mois
- Plan gratuit : voix pré-définies uniquement (Adam, Antoni, Daniel, Josh…)
- Plan Starter (5€/mois) : accès aux voix de la Voice Library (Frederick Surrey, etc.)
- La clé est entrée une fois dans ⚙️ et reste en localStorage

---

## Swap de pronoms

### Français
| Entrée | Sortie |
|--------|--------|
| je | tu |
| j'ai | tu as |
| j'en ai | tu en as |
| je suis | tu es |
| je me sens | tu te sens |
| mon / ma / mes | ton / ta / tes |
| me / moi | te / toi |

### Anglais
| Entrée | Sortie |
|--------|--------|
| I am / I'm | you are / you're |
| I feel | you feel |
| I have / I've | you have / you've |
| my | your |
| myself | yourself |
| me | you |

---

## Roadmap

### v1 — Actuel ✅
- [x] Reconnaissance vocale continue (sans bouton par phrase)
- [x] Swap de pronoms FR ↔ EN
- [x] ElevenLabs TTS + fallback navigateur
- [x] Sélection de langue et de voix
- [x] Expérience voice-only (pas de texte affiché)
- [x] Code refactorisé (HTML / CSS / JS séparés)

### v2 — Base portable en cours
- [x] Copy, voix et conversion de texte séparées du shell web
- [ ] Stabiliser la reco / voix pour les tests de 15 min
- [ ] Redesign visuel terracotta (Emerge: Let it out)
- [ ] Flow d'accueil : premier écran → bouton unique → session
- [ ] Intro vocale (15s pour first-timer, rien pour les suivants)
- [ ] Outro vocale (atterrissage doux en fin de session)
- [ ] Bouton grounding discret (pause d'urgence)
- [x] Respiration guidée 5 minutes (5 secondes d'inspiration / 5 secondes d'expiration)

### v3 — iPhone natif
- [ ] Créer un prototype SwiftUI minimal avec Apple SpeechAnalyzer
- [ ] Créer le même prototype avec Deepgram Flux
- [ ] Comparer latence, précision, découpage des silences et stabilité pendant 60 minutes
- [ ] Choisir le moteur principal et décider si un fallback est nécessaire
- [ ] Reprendre le core portable dans l'app iPhone
- [ ] Utiliser AVSpeechSynthesizer pour la répétition
- [ ] Intégrer les guidances préenregistrées
- [ ] Valider le ressenti vocal sur iPhone 15, 15 Pro et 16+

### v4 — Futur
- [ ] Mode Rewire : choisir une énergie → posture guidée → affirmations × 3
- [ ] PWA (manifest.json + icônes, installable sur téléphone)
- [ ] Bêta TestFlight puis publication App Store
- [ ] Prompts vocaux subtils pendant la session (×1-2 max)

---

## Identité visuelle

- **Nom** : Emerge: Let it out
- **Palette** : `#1a100a` fond · `#e07a5f` terracotta · `#f2cc8f` doré · `#f5ede5` texte
- **Cible** : personnes stylées, intellectuelles, qui cherchent à gérer leurs émotions de manière profonde et efficace
- **Ton** : sobre, scientifique, chaleureux — pas wellness-hippy

### Versions de la homepage

Deux versions complètes de la homepage sont conservées dans le projet :

- **Home 1** : fond noir avec un jet organique de poussière cuivre et or. C'est la version active.
- **Home 2** : fond noir avec les courbes orbitales discrètes de la version précédente.

Le choix actif se trouve sur la balise `<body>` dans `index.html` :

```html
<body data-home-version="home1">
```

Pour restaurer Home 2, il suffit de remplacer `home1` par `home2`. Les deux fonds restent enregistrés dans `assets/` et aucune reconstruction n'est nécessaire.

Voir [la comparaison visuelle des deux homepages](docs/homepage-comparison.md).

---

## Notes de développement

- Chrome est requis pour la Web Speech API (pas de support Firefox/Safari)
- Le token GitHub ne doit jamais transiter par Discord (révocation automatique)
- Deploy : `git push` sur `main` → GitHub Pages se met à jour automatiquement
