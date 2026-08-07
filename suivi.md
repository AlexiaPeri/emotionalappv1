# Suivi du projet

## État actuel
- Le projet contient un prototype web multi-pages.
- Le core web voix / répétition existe déjà, mais la Web Speech API de Chrome n'est pas considérée assez fiable pour l'app finale.
- Le home a été l’objet principal de dérive visuelle.
- Le logo fourni par l’utilisateur est présent dans le projet.
- L'architecture iPhone doit maintenant être validée par un prototype natif.

## Ce qui doit rester stable
- Le nom Emerge.
- Le principe de pratique vocale.
- Les deux variantes documentées du home doivent rester disponibles.
- Le français et l’anglais.

## Ce qui doit être traité séparément
- Le design du home.
- La stabilité de la voix.
- Les textes.
- La préparation iPhone.
- La comparaison Apple SpeechAnalyzer / Deepgram Flux.

## Décisions prises
- Le screenshot validé est la seule base visuelle.
- Le logo utilisé doit être celui fourni par l’utilisateur.
- Les ajouts créatifs non demandés doivent être évités.
- Home 1 est la version active : fond noir avec jet organique de poussière cuivre et or.
- Home 2 conserve intégralement le fond orbital précédent. Le choix se fait avec `data-home-version` dans `index.html`.
- La comparaison partageable des deux versions se trouve dans `docs/homepage-comparison.md`.
- Page Ground : utiliser l'image verticale fournie du 20 juin 18:45, affichée en format iPhone et ancrée en bas pour préserver le chat.
- Page Ground : la variante mauve assombrie est active ; l'indicateur audio est placé dans la partie basse de la rivière, entre la cascade et le chat.
- Liste d'aide : la première proposition ouvre une respiration guidée de 5 minutes, alternant 5 secondes d'inspiration et 5 secondes d'expiration avec un signal sonore doux. La fin ou la sortie ramène à la liste.
- Page choix durée : afficher une petite phrase (`Commençons` / `Let's begin`) au-dessus des deux boutons.
- Page pratique : phrase centrale `Tout ce que tu ressens est bienvenu` / `Everything you feel is welcome`.
- Pages Guide/FAQ : éviter les titres répétitifs en haut des cartes ; la FAQ n'a pas besoin d'un titre `FAQ` en plus de l'onglet.
- Gestion Git : Codex doit gérer les commits/push régulièrement après les blocs de travail stables. Les instructions persistantes sont dans `AGENTS.md`.
- Textes Guide/FAQ : modifier directement `js/app-config.js`, dans `introReadText` et `faqItems` pour chaque langue.
- L'app finale sera native en SwiftUI ; Capacitor n'est plus la stratégie cible.
- Cible de la première bêta : iPhone 15 ou plus récent avec iOS 26 ou plus récent.
- La première bêta demande une connexion internet afin de garder Deepgram disponible pendant l'évaluation.
- Apple SpeechAnalyzer et Deepgram Flux sont les deux candidats pour la reconnaissance vocale.
- Le choix final sera fait après deux prototypes identiques et un test d'endurance de 60 minutes.
- L'app vérifiera dynamiquement `SpeechTranscriber.isAvailable` et les locales FR/EN.
- La répétition utilisera AVSpeechSynthesizer avec une voix iPhone Enhanced ou Premium.
- Les guidances utiliseront la voix préenregistrée d'Alexia.
- La transformation des pronoms restera locale et déterministe, sans LLM.
- Si Deepgram est retenu, la clé restera sur un backend et l'app recevra uniquement un jeton temporaire.
- La source de vérité technique est `docs/ios-voice-strategy.md`.
- Le studio privé `writing.html` centralise les 26 ensembles de textes FR/EN, leurs objectifs, leurs statuts et leur export.
- L'inventaire éditorial de référence se trouve dans `docs/content-inventory.md`.
- Les brouillons du studio restent dans le navigateur et doivent être exportés régulièrement ; ils ne sont pas ajoutés automatiquement à Git.
- Le site public consacré uniquement à l'app se trouve dans `site/` et s'ouvre localement sur `/site/`.
- Le wording du premier site Emerge est archivé dans `docs/previous-app-site-copy.md` avant la réaffectation du domaine d'Alexia.
- La sauvegarde complète du premier site (capture, document Pages/Word, texte copiable et HTML original) se trouve dans `docs/site-archive/`. Son wording anglais est aussi disponible dans l'entrée `Site de présentation · texte source` du studio d'écriture.
- Le site distingue les mécanismes soutenus par la recherche de l'hypothèse produit propre à la répétition vocale Emerge.
- Le site public ne révèle pas la boucle exacte de répétition avant que la personne comprenne l'intérêt de la pratique. Il parle d'abord de focus, de contact, de mouvement, de profondeur et de sortie du mental.
- La répétition Meisner est citée comme inspiration, sans présenter Emerge comme une formation Meisner.
- Le design en étapes séparées précédemment créé pour expliquer `Feel / Say / Hear / Repeat` est conservé comme piste pour une future refonte du Guide, pas pour le site public. La référence se trouve dans `docs/guide-step-layout-reference.md`.
- Dans la communication scientifique, ne pas confondre libération émotionnelle et simple défoulement. Les liens entre difficultés de régulation et agressivité sont associatifs, pas une preuve qu'Emerge prévient la violence.
- Sur un viewport iPhone, les pages de l'app restent entièrement contenues dans le cadre : la navigation principale est superposée dans sa zone haute et ne doit pas repousser le cadre sous la fenêtre.
- Dès qu'une session commence, l'app passe en mode protégé : navigation, langue et réglages sont masqués pendant la pratique, le Guide ouvert comme pause, le closing et le parcours de soutien. Ils réapparaissent après la sortie de session.
- Le parcours de soutien doit rester entièrement dans la langue choisie et proposer une action de sortie visible en plus du raccourci consistant à toucher l'écran.
- L'espace privé de pilotage des bêta-tests se trouve dans `beta/index.html` et le questionnaire bilingue dans `beta/questionnaire.html`. Les brouillons et réponses restent locaux jusqu'à leur export et ne doivent pas être commités.

## À faire ensuite
1. Rédiger et valider les textes et audios FR/EN dans le studio d'écriture.
2. Créer un prototype SwiftUI minimal avec Apple SpeechAnalyzer.
3. Créer le même prototype avec Deepgram Flux.
4. Tester sur iPhone 15/15 Plus, iPhone 15 Pro/Pro Max et iPhone 16+.
5. Comparer latence, précision, pauses émotionnelles et stabilité pendant 60 minutes.
6. Choisir le moteur STT principal et décider si un fallback est nécessaire.
7. Finaliser et enregistrer les guidances.
8. Construire l'app native complète puis préparer TestFlight.

## Notes
- Les erreurs précédentes venaient surtout d’une interprétation trop libre.
- Le bon réflexe est de ralentir et de confirmer la base avant de modifier.
