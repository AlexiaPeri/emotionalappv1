# Emerge: Let it out

**Expérience de libération émotionnelle guidée par la voix, disponible dans une app iPhone native et une web app responsive dédiée aux tests utilisateurs**

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
Choix de la durée, de l'opening et des rappels corporels
       ↓
Opening préenregistré avec la voix d'Alexia
       ↓
Utilisateur parle
       ↓
Speech Recognition (Web Speech API, Chrome)
       ↓
Swap de pronoms (FR: je→tu / EN: I→you)
       ↓
Gemini 3.8 Flash-Lite TTS en streaming PCM 24 kHz
       ↓
L'app répète vocalement
```

**Pas de texte affiché pendant la session.** L'expérience de pratique reste vocale.

La page de préparation web reprend le parcours de l'app native : 15 minutes ou un picker personnalisé de 3 à 60 minutes, Quiet arrival, Guided release ou Full guidance, Movement reminders facultatifs et désactivés par défaut, puis choix final d'une voix féminine ou masculine. Les noms techniques des voix ne sont pas affichés. Les écrans d'opening, de closing, de grounding, d'après-session et de fin reprennent aussi les mêmes contrôles que l'iPhone, notamment `Skip guidance`, `Continue the session`, `Finish the session` et `End the guidance`. Quiet arrival, Full guidance, Closing et Grounding utilisent les enregistrements d'Alexia. Guided release et les rappels corporels attendent encore leurs nouveaux enregistrements ; aucune voix synthétique provisoire ne les remplace.

### Deux designs distincts, un même parcours

La web app possède désormais deux présentations responsive clairement séparées. Elles utilisent exactement les mêmes textes, choix, données locales et logique de session ; seul le système de mise en page change automatiquement selon la largeur disponible.

- **Design téléphone / iPhone (`< 900 px`)** : le design mobile historique est conservé intact, avec ses proportions verticales, ses cartes, sa navigation compacte et son déroulé en une colonne. Il reste la référence visuelle de l'app native.
- **Design web desktop (`≥ 900 px`)** : une interface paysage dédiée exploite la largeur de l'écran sans agrandir artificiellement un cadre de téléphone. Elle ajoute un header web horizontal, un accueil éditorial en paysage, une préparation de pratique en deux zones, un Guide à largeur de lecture confortable, une FAQ avec rail de contact, un formulaire desktop et une grille de notes.
- **Pratique en cours** : même sur ordinateur, elle reste volontairement étroite et centrée pour éviter toute distraction pendant l'expérience vocale.
- **Écrans illustrés** : Grounding, Breathing et Thank you utilisent un stage web large, mais leurs compositions verticales restent centrées et ne sont ni étirées ni déformées.

Le breakpoint desktop se trouve exclusivement dans le bloc `@media (min-width: 900px)` de `css/styles.css`. Toute évolution desktop doit rester dans cette couche afin de ne pas modifier involontairement le design téléphone.

---

## Stack du prototype web

- **Frontend** : HTML / CSS / JS vanilla (zéro dépendance)
- **Core portable** : copy, presets de voix, transformation de texte
- **Pages** : accueil, pratique, FAQ, contact
- **Reconnaissance vocale** : Web Speech API (Chrome uniquement)
- **TTS de répétition** : Gemini 3.8 Flash-Lite TTS en streaming PCM 24 kHz ; voix navigateur uniquement en secours technique
- **Voix finales** : Callirrhoe (féminine) et Umbriel (masculine), choisies avant la pratique et mémorisées sur l'appareil
- **Hébergement actuel** : Vercel pour le frontend et la fonction Gemini sécurisée
- **Clé Gemini** : exclusivement côté serveur via `GEMINI_API_KEY`, jamais dans le navigateur ni dans Git

La boucle de répétition utilise désormais l'endpoint sécurisé `api/tts.js`, qui limite les modèles, voix, longueurs et origines autorisés avant de transmettre le texte à Gemini. L'audio est renvoyé progressivement sous forme de PCM mono 24 kHz et joué avec Web Audio dès l'arrivée des premiers morceaux. La reconnaissance donne la priorité au résultat final du navigateur et demande sa finalisation dès que la fin de parole est détectée, au lieu de valider prématurément un résultat intermédiaire. Un watchdog redémarre automatiquement une écoute qui resterait bloquée et, lorsque le navigateur le permet, un biais contextuel modéré améliore la reconnaissance du vocabulaire émotionnel anglais. L'écoute reprend presque immédiatement après la voix ; une phrase identique prononcée à nouveau n'est jamais écartée et son audio déjà généré est rejoué depuis un petit cache mémoire. La consigne vocale demande un débit conversationnel vif, sans pause dramatique, avec une cadence déclarative descendante et jamais une intonation interrogative. Le comparateur privé `voice-lab.html` reste disponible pour les essais ; ses extraits réussis sont conservés dans le cache du navigateur.

Le bouton `Write to us` de la FAQ ouvre un formulaire nom, email et message. La fonction sécurisée `api/contact.js` valide et limite les envois, puis les transmet au même système de collecte que le formulaire public d'Emerge. Aucune donnée de contact n'est conservée dans le navigateur ni ajoutée au dépôt.

La FAQ contient également un résumé bilingue de confidentialité et des conditions d'utilisation de la bêta : traitement vocal, notes locales, données du formulaire, droits liés aux coordonnées, restriction 18+, cadre de sécurité et statut non médical. Ce résumé devra être remplacé ou complété par des documents juridiques autonomes avant un lancement public à plus grande échelle.

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
- **Langue de la première version** : anglais uniquement. Le français reste conservé pour une version ultérieure.
- **Connexion internet** : non requise par l'implémentation Apple actuelle ; elle ne deviendrait nécessaire que si Deepgram était retenu ultérieurement.
- **Contrôle au démarrage** : vérifier `SpeechTranscriber.isAvailable` et la présence de la locale anglaise avant d'activer Apple SpeechAnalyzer.
- **Échantillon alpha minimum** : un iPhone 15/15 Plus, un iPhone 15 Pro/Pro Max et un iPhone 16 ou plus récent.

### App native actuelle

La V1 SwiftUI se trouve dans [`ios/Emerge`](ios/Emerge). Elle compile avec Xcode 27 pour iOS 26 et utilise Apple SpeechAnalyzer, la transformation anglaise locale et AVSpeechSynthesizer.

Le parcours anglais est implémenté de bout en bout : invitation à lire le guide au premier lancement, choix de durée, opening première session ou retour, répétition vocale, rappel du guide, fin anticipée, closing, reprise libre, grounding, aide complémentaire, respiration guidée avec accompagnement sonore, réflexion, notes locales, écran de fin et FAQ. Les quatre guidances utilisent les enregistrements d'Alexia ; aucune voix synthétique ne remplace ces passages statiques.

La préparation de la pratique propose deux durées de même importance visuelle — 15 minutes ou une durée personnalisée de 3 à 60 minutes — ainsi que trois openings : court et neutre, court et plus intense, ou guidance longue. La guidance longue reste accessible après la première utilisation. Des rappels corporels facultatifs peuvent être activés pour la pratique ; ils sont désactivés par défaut. La pratique vocale déclare le mode audio iOS en arrière-plan afin de continuer l'écoute et la répétition lorsque l'écran se verrouille.

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
│   ├── content-inventory.md ← Inventaire éditorial
│   └── site-archive/        ← Sauvegarde complète du premier site Emerge
├── ios/Emerge/          ← App iPhone native SwiftUI
└── README.md
```

### Studio d'écriture

Ouvrir `http://127.0.0.1:5173/writing.html` lorsque le serveur Vite est lancé.

- 25 ensembles de textes organisés par priorité.
- L'anglais est la source de vérité de la V1 ; les brouillons français restent conservés pour plus tard.
- Objectif éditorial et questions de réflexion pour chaque texte.
- Sauvegarde automatique dans le navigateur.
- Statuts `À écrire`, `À revoir`, `Brouillon` et `Validé`.
- Export complet en Markdown.

Les brouillons ne sont pas envoyés vers un serveur et ne modifient pas automatiquement le code de l'app. Utiliser régulièrement le bouton `Exporter` pour conserver une copie en dehors du navigateur.

### Site public Emerge

Ouvrir `http://127.0.0.1:5173/site/` lorsque le serveur Vite est lancé.

Le site public présente le besoin, la pratique, l'expérience, les fondements scientifiques et la vision du produit, sans dévoiler trop tôt la mécanique exacte de répétition. Il reste distinct du prototype et ne présente pas les mécanismes étudiés comme une preuve d'efficacité de l'app. La stratégie éditoriale et les sources sont documentées dans [docs/marketing-site-strategy.md](docs/marketing-site-strategy.md).

Le premier site publié sur `alexiaperineau.com` est sauvegardé dans [docs/site-archive/Emerge-original-site-archive.md](docs/site-archive/Emerge-original-site-archive.md). Le dossier contient également un document `.docx` ouvrable dans Pages, une capture pleine page, le HTML original et son logo.

### Espace de bêta-test

Ouvrir `http://127.0.0.1:5173/beta/` pour préparer et consigner les sessions de recherche. Le questionnaire bilingue destiné aux testeurs se trouve sur `http://127.0.0.1:5173/beta/questionnaire.html`.

- Checklist de préparation persistante.
- Protocole de test modéré.
- Journal de sessions avec codes participants.
- Cadre de priorisation `S0` à `S3`.
- Questionnaire FR/EN en cinq étapes avec sauvegarde locale et export JSON.

Les données de recherche restent locales jusqu'à leur export et ne doivent jamais être ajoutées au dépôt Git. Le protocole complet se trouve dans [docs/beta-testing-plan.md](docs/beta-testing-plan.md).

---

## Lancer en local

### Interface locale

```bash
npm install
npm run dev
```

Vite affiche ensuite l'URL locale. La fonction vocale sécurisée est disponible sur la version Vercel ; pour la tester localement, utiliser `vercel dev` avec les variables d'environnement du projet.

> ⚠️ Ne pas ouvrir `index.html` directement en `file://` — les modules JS sont bloqués par le navigateur.

---

## Configuration Gemini TTS

1. Copier les noms de variables de `.env.example` dans les secrets de l'hébergeur.
2. Définir `GEMINI_API_KEY` avec la clé du projet Google AI Studio Emerge.
3. Ne jamais ajouter une vraie clé à `.env.example`, au dépôt Git ou au code navigateur.
4. Déployer le projet sur Vercel : le frontend Vite et la fonction `/api/tts` sont configurés par `vercel.json`.
5. Ouvrir `/voice-lab.html` pour comparer les voix, ou lancer une pratique pour tester Callirrhoe et Umbriel en streaming.

Le serveur autorise actuellement `gemini-3.8-flash-tts` et `gemini-3.8-flash-lite-tts`, avec une limite de 320 caractères par génération et un rate limit de précaution.

Le Free Tier Google est insuffisant pour un test complet (actuellement 3 requêtes par minute et 10 par jour pour chaque modèle). La facturation Google doit être activée avant les tests utilisateurs et la mise en production ; le comparateur affiche une erreur explicite lorsque ce quota est atteint.

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
- [x] Gemini Flash-Lite streaming + fallback navigateur
- [x] Sélection Callirrhoe / Umbriel mémorisée localement
- [x] Expérience voice-only (pas de texte affiché)
- [x] Code refactorisé (HTML / CSS / JS séparés)

### v2 — Base portable en cours
- [x] Copy, voix et conversion de texte séparées du shell web
- [ ] Stabiliser la reco / voix pour les tests de 15 min
- [x] Redesign visuel terracotta (Emerge: Let it out)
- [x] Flow d'accueil : premier écran → bouton unique → session
- [x] Scripts anglais V1 finalisés : première session, retour, closing et grounding
- [x] Enregistrer et intégrer les quatre guidances avec la voix d'Alexia
- [x] Bouton grounding discret (pause d'urgence)
- [x] Respiration guidée 5 minutes (5 secondes d'inspiration / 5 secondes d'expiration)

### v3 — iPhone natif
- [x] Installer Xcode et créer un prototype SwiftUI minimal avec Apple SpeechAnalyzer
- [ ] Créer le même prototype avec Deepgram Flux
- [ ] Comparer latence, précision, découpage des silences et stabilité pendant 60 minutes
- [ ] Choisir le moteur principal et décider si un fallback est nécessaire
- [x] Reprendre le core portable dans l'app iPhone
- [x] Utiliser AVSpeechSynthesizer pour la répétition
- [x] Implémenter le parcours anglais complet, le support, la réflexion et les notes locales
- [x] Intégrer les quatre guidances préenregistrées
- [ ] Valider le ressenti vocal sur iPhone 15, 15 Pro et 16+

### v4 — Futur
- [ ] Mode Rewire : choisir une énergie → posture guidée → affirmations × 3
- [ ] PWA (manifest.json + icônes, installable sur téléphone)
- [ ] Activer l'adhésion Apple Developer, créer la bêta TestFlight puis préparer la publication App Store
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
- Deploy : `git push` sur `main`, puis `npx vercel@latest --prod --yes` tant que l'accès du projet Vercel au dépôt GitHub privé n'a pas été réautorisé
