# Problèmes et solutions

## 1. Dérive visuelle
**Problème**  
Le home a été modifié au lieu d’être reproduit fidèlement.

**Cause probable**  
Interprétation créative au lieu d’exécution stricte.

**Solution**  
- Utiliser une seule référence.
- Interdire les ajouts non demandés.
- Valider chaque micro-changement.
- Reprendre exactement la structure du screenshot validé :
  - logo en haut
  - `EMERGE`
  - `LET IT OUT`
  - trait fin
  - texte `This is your space to release.`
  - bouton `ENTER`
  - `Everything you feel is welcome` en bas
  - fond noir/terracotta/or avec motif subtil
- Supprimer toute rangée `CRY / LAUGH / SHAKE / BE REAL`
- Supprimer toute écriture manuscrite ou ajout décoratif non présent dans la référence

**Prévention**  
Toujours demander : “est-ce que ceci est dans la référence ?”

---

## 2. Mélange des langues / états
**Problème**  
Le code et l’UI peuvent devenir confus quand FR, EN, réglages et home se mélangent.

**Cause probable**  
Plusieurs objectifs modifiés en même temps.

**Solution**  
- Séparer les responsabilités.
- Garder les changements de langue indépendants du design.
- Éviter de toucher au core voix pendant une refonte UI.

**Prévention**  
Une seule famille de changements par itération.

---

## 3. Ajouts décoratifs parasites
**Problème**  
Des éléments comme gros motif, courbe, tagline manuscrite ou icônes peuvent casser le rendu.

**Cause probable**  
Tentative d’enrichir le visuel sans demande explicite.

**Solution**  
- Supprimer tout ce qui n’apparaît pas dans la référence.
- Garder uniquement les éléments confirmés.

**Prévention**  
Comparer chaque élément du rendu à la référence.

---

## 4. Manque de confiance dans la base
**Problème**  
On ne sait plus quelle version est la bonne base.

**Cause probable**  
Trop de versions intermédiaires.

**Solution**  
- Nommer une seule version de référence.
- Documenter ce qui est validé.
- Repartir de cette base uniquement.

**Prévention**  
Utiliser `plan.md`, `suivi.md`, `problemes.md` comme mémoire de projet.

---

## 5. Transfert à une autre IA
**Problème**  
Une autre IA peut refaire les mêmes erreurs sans contexte.

**Solution**  
Lui transmettre :
- la référence validée,
- les règles de non-dérive,
- les changements déjà refusés,
- l’état du code,
- la prochaine action unique.

---

## 6. Reconnaissance vocale fragile dans le prototype web

**Problème**

La Web Speech API de Chrome peut s'arrêter, redémarrer difficilement ou ne plus produire de résultat après une courte durée. Cette fiabilité est insuffisante pour une pratique de 12 à 60 minutes.

**Cause probable**

Le navigateur garde une partie du cycle de vie de la reconnaissance et de la détection de fin de phrase hors du contrôle de l'app.

**Solution prévue**

- Ne pas utiliser Chrome comme référence de fiabilité pour l'app finale.
- Construire deux prototypes natifs identiques : Apple SpeechAnalyzer et Deepgram Flux.
- Tester les deux pendant 60 minutes sur plusieurs iPhone.
- Utiliser une machine d'état explicite : écoute → fin de tour → transformation → répétition → reprise.
- Suspendre l'écoute pendant la voix de répétition pour éviter l'auto-transcription.
- Ajouter récupération automatique, surveillance de connexion et gestion des interruptions audio.

**Prévention**

Valider toute modification de la couche vocale avec un test d'endurance et des mesures de latence, pas seulement avec quelques phrases manuelles.

---

## 7. Choix prématuré d'un fournisseur vocal

**Problème**

Deepgram a d'abord été retenu pour remplacer Chrome, mais Apple SpeechAnalyzer offre désormais une alternative native, locale et potentiellement plus fiable sur iOS 26.

**Solution**

- Garder les deux options ouvertes jusqu'au test comparatif.
- Vérifier `SpeechTranscriber.isAvailable` et les locales installables sur chaque appareil.
- Comparer avec la même interface, la même voix et le même moteur de pronoms.
- Documenter la décision finale et ses mesures dans `docs/ios-voice-strategy.md`.

**Prévention**

Ne pas engager une architecture, un abonnement ou un backend avant d'avoir mesuré le comportement sur les iPhone cibles.
