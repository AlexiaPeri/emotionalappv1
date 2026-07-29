# Plan de travail transférable

## Objectif
Construire Emerge comme une app iPhone native de pratique émotionnelle vocale, simple à utiliser, élégante, fiable pendant 12 à 60 minutes et fidèle au home validé. Le prototype web reste l'outil rapide de design et de validation des parcours.

## Référence visuelle du home
Le design cible est celui du screenshot validé :
- écran iPhone noir, très élégant, profond, luxueux
- palette noir / terracotta / or
- motif de fond subtil avec poussières dorées et arcs organiques
- logo centré en haut
- titre `EMERGE`
- sous-titre `LET IT OUT`
- petit trait horizontal fin
- texte centré `This is your space to release.`
- gros bouton arrondi `ENTER`
- texte bas `Everything you feel is welcome`
- aucune rangée `CRY / LAUGH / SHAKE / BE REAL`
- aucune écriture manuscrite / script cheap
- aucun élément décoratif ajouté qui n’existe pas dans la référence

## Règle centrale
Ne jamais “réinventer” un élément déjà validé.
Quand un visuel, un texte ou un flux est confirmé, il devient la référence.

## Priorités
1. Finaliser la carte des textes, guidances et états de l'app.
2. Comparer Apple SpeechAnalyzer et Deepgram Flux dans deux prototypes iPhone minimaux.
3. Stabiliser la boucle écoute → pronoms → répétition pendant 60 minutes.
4. Garder une base visuelle cohérente avec le screenshot validé.
5. Séparer clairement le core de pratique, l'UI, les textes et la couche vocale.

## Stratégie iPhone

- App native en SwiftUI.
- Cible bêta : iPhone 15 ou plus récent, iOS 26 ou plus récent.
- Français et anglais au lancement.
- Apple SpeechAnalyzer et Deepgram Flux restent les deux candidats STT jusqu'au test comparatif.
- AVSpeechSynthesizer et les voix iPhone servent à la répétition.
- La voix préenregistrée d'Alexia sert aux openings, closings et guidances de support.
- La transformation des pronoms reste locale, déterministe et testée.
- Deepgram, s'il est retenu, utilise des jetons temporaires ; aucune clé secrète dans l'app.

Voir `docs/ios-voice-strategy.md` pour le protocole de décision complet.

## Méthode de travail
- Travailler par petits changements isolés.
- Vérifier chaque changement contre la référence avant d’aller plus loin.
- Préférer une correction ciblée à une refonte.
- Ne pas mélanger plusieurs sujets dans la même itération.

## Contrôles avant modification
- Identifier la source de vérité.
- Définir ce qui est intouchable.
- Lister ce qui peut être ajusté.
- Noter les effets attendus.
- Pour la couche vocale, mesurer sur un vrai iPhone au lieu de conclure à partir du prototype Chrome.

## Ordre d’exécution
1. Lire le besoin exact.
2. Comparer au code actuel.
3. Identifier l’écart.
4. Corriger uniquement l’écart.
5. Vérifier le rendu ou le build.

## Règles d’arrêt
- Si la direction visuelle n’est pas claire, stopper plutôt que d’interpréter.
- Si une modification risque de dévier du rendu validé, demander confirmation.
- Si une correction touche plusieurs zones, séparer en étapes.
- Ne pas choisir définitivement Apple ou Deepgram avant le test comparatif.

## Handoff à une autre IA
Transmettre :
- la référence validée,
- les invariants,
- l’état actuel,
- les problèmes connus,
- les prochaines actions.
