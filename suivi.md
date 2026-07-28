# Suivi du projet

## État actuel
- Le projet contient un prototype web multi-pages.
- Le core voix / répétition existe déjà.
- Le home a été l’objet principal de dérive visuelle.
- Le logo fourni par l’utilisateur est présent dans le projet.

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

## À faire ensuite
1. Revenir à une base UI stable.
2. Verrouiller une version de référence du home.
3. Vérifier que les langues FR/EN restent disponibles.
4. Reprendre ensuite la pratique vocale si besoin.

## Notes
- Les erreurs précédentes venaient surtout d’une interprétation trop libre.
- Le bon réflexe est de ralentir et de confirmer la base avant de modifier.
