# Emerge: Let it out

**App web de libération émotionnelle par la voix**

Quand tu as un trop-plein d'émotions — au lieu de scroller — tu ouvres Emerge, tu parles, et l'app te répète ce que tu ressens. C'est tout. Ça marche.

---

## Ce que c'est

Emerge est une app voice-only basée sur la technique de répétition de Meisner. L'utilisateur parle librement de ce qu'il ressent. L'app capte sa voix, transforme les pronoms (je → tu, I → you), et le répète vocalement via ElevenLabs TTS.

Pas de journaling. Pas de conseils. Juste tes mots, retournés vers toi par une voix calme.

### Pourquoi ça marche

La répétition émotionnelle force à rester dans le ressenti au lieu de l'analyser. S'entendre dire "tu te sens dépassé" par une voix extérieure active une distanciation naturelle — le même mécanisme que dans la thérapie Meisner ou la gestalt.

### Positionnement

**L'alternative au scrolling.** Quand une émotion forte arrive, le réflexe c'est d'ouvrir Instagram. Emerge est là pour être l'autre option — accessible en 1 tap, immédiat, sans effort cognitif.

---

## Fonctionnement

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

**Pas de texte affiché pendant la session.** Expérience 100% vocale.

---

## Stack technique

- **Frontend** : HTML / CSS / JS vanilla (zéro dépendance)
- **Reconnaissance vocale** : Web Speech API (Chrome uniquement)
- **TTS** : ElevenLabs API (`eleven_turbo_v2_5`) + fallback voix navigateur
- **Hébergement** : GitHub Pages
- **Clé API** : stockée en localStorage côté client, jamais en dur dans le code

---

## Structure

```
.
├── index.html          ← Point d'entrée
├── css/
│   └── styles.css      ← Thème terracotta
├── js/
│   └── app.js          ← Logique complète
└── README.md
```

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

### v2 — En cours
- [ ] Redesign visuel terracotta (Emerge: Let it out)
- [ ] Flow d'accueil : premier écran → bouton unique → session
- [ ] Intro vocale (15s pour first-timer, rien pour les suivants)
- [ ] Outro vocale (atterrissage doux en fin de session)
- [ ] Bouton grounding discret (pause d'urgence)

### v3 — Futur
- [ ] Mode Rewire : choisir une énergie → posture guidée → affirmations × 3
- [ ] PWA (manifest.json + icônes, installable sur téléphone)
- [ ] App Store (Capacitor)
- [ ] Prompts vocaux subtils pendant la session (×1-2 max)

---

## Identité visuelle

- **Nom** : Emerge: Let it out
- **Palette** : `#1a100a` fond · `#e07a5f` terracotta · `#f2cc8f` doré · `#f5ede5` texte
- **Cible** : personnes stylées, intellectuelles, qui cherchent une alternative sérieuse au scrolling
- **Ton** : sobre, scientifique, chaleureux — pas wellness-hippy

---

## Notes de développement

- Chrome est requis pour la Web Speech API (pas de support Firefox/Safari)
- Le token GitHub ne doit jamais transiter par Discord (révocation automatique)
- Deploy : `git push` sur `main` → GitHub Pages se met à jour automatiquement
