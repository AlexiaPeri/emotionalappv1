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
