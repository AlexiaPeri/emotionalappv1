# Plan de bêta-test Emerge

## Objectif

La bêta doit aider à prendre des décisions produit. Elle ne cherche pas à démontrer une efficacité thérapeutique ou clinique.

Les cinq questions principales sont :

1. Une personne comprend-elle la pratique et commence-t-elle sans aide ?
2. La boucle vocale reste-t-elle rapide, juste et stable pendant une vraie session ?
3. Les changements de pronoms sont-ils corrects en français et en anglais ?
4. La personne sait-elle revoir les instructions, demander du soutien et terminer sans perdre le contrôle ?
5. Dans quelle situation réelle aurait-elle envie de réutiliser l'app ?

## Outils

- Espace de pilotage : `/beta/`
- Questionnaire testeur bilingue : `/beta/questionnaire.html`
- Studio éditorial : `/writing.html`

L'espace de pilotage et le questionnaire sauvegardent leurs brouillons dans le navigateur. Les réponses ne sont pas centralisées sur un serveur. Pour chaque session, exporter le fichier JSON et le conserver dans un emplacement privé adapté. Ne pas ajouter les réponses des participants au dépôt Git.

## Échantillon conseillé

### Phase 1 : tests modérés

- 5 à 8 personnes.
- Mélanger premières utilisations et personnes déjà familières avec des pratiques corporelles ou émotionnelles.
- Inclure les deux langues avant de considérer la localisation comme prête.
- Couvrir au minimum un iPhone 15, un iPhone 15 Pro et un modèle plus récent.

Cette phase sert à trouver les blocages importants. Elle doit rester petite pour permettre des corrections rapides entre les sessions.

### Phase 2 : bêta à distance

- 15 à 30 personnes après correction des problèmes S0 et S1.
- Demander au moins deux sessions par personne afin de distinguer la difficulté de découverte de l'expérience récurrente.
- Ne pas recruter uniquement dans l'entourage proche de la fondatrice.

## Déroulement d'un test modéré

1. Accueil, consentement et rappel des limites : 5 minutes.
2. Contexte technique sans données émotionnelles : 5 minutes.
3. Session autonome : 15 minutes.
4. Questionnaire immédiat : 8 minutes.
5. Entretien ouvert : 10 minutes.

Le modérateur ne présente pas l'interface avant la tâche. Il observe les hésitations et attend avant d'aider, sauf si la sécurité ou le bien-être du participant est en jeu.

## Données à ne pas collecter

- Le contenu exact des phrases prononcées pendant la pratique.
- Le détail de l'émotion travaillée.
- Un diagnostic, un historique médical ou psychologique.
- Le nom complet si un code participant suffit.
- Une citation utilisable publiquement sans consentement séparé.

## Lecture des résultats

Les scores chiffrés servent à repérer des motifs et à comparer les versions. Avec un petit échantillon, ils ne constituent pas une preuve statistique.

Prioriser dans cet ordre :

- `S0 · Sécurité` : détresse aggravée, sortie impossible, mauvaise guidance, audio qui continue hors contexte.
- `S1 · Bloquant` : impossible de commencer, pratiquer ou terminer.
- `S2 · Friction` : tâche possible mais hésitation, effort ou perte de confiance.
- `S3 · Polish` : détail visuel ou rédactionnel sans effet majeur sur le parcours.

Un compliment général ne suffit pas à valider une fonctionnalité. Chercher le comportement observé, le contexte d'usage envisagé et la raison donnée par le testeur.

## Critères avant d'élargir la bêta

- Aucun problème S0 ouvert.
- Aucun blocage récurrent pour commencer ou terminer.
- Aucun audio ne continue après avoir quitté sa guidance.
- La majorité des testeurs comprend la répétition sans aide.
- Les erreurs de reconnaissance et de pronoms sont suffisamment rares pour ne pas casser le rythme.
- Les testeurs identifient spontanément un moment où ils pourraient réutiliser l'app.

## Confidentialité opérationnelle

Avant un test à distance réel, choisir un système de collecte disposant d'une politique de confidentialité et d'un stockage adaptés. Le prototype actuel produit un export local pour éviter de créer silencieusement une base de données sensible. Les fichiers exportés doivent être stockés hors du dépôt public et supprimés selon une durée définie avant le recrutement.
