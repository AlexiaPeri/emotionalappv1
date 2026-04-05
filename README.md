# Emotional App v1

Application web locale qui:
- capture la voix utilisateur (SpeechRecognition),
- reformule le texte (inversion des pronoms FR/EN),
- rejoue la phrase avec TTS (ElevenLabs si cle API, sinon voix navigateur).

## Structure

```text
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── package.json
```

## Lancer le projet

### Option recommandee (npm + Vite)

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichee (par defaut `http://localhost:5173`).

### Option sans npm

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Limite actuelle (la plus importante)

La voix reste souvent "robotique" pour 2 raisons principales:
- fallback navigateur (Web Speech API) peu expressif,
- reglages ElevenLabs statiques et non relies a l'emotion detectee.

## Pistes d'amelioration priorisees (focus voix emotionnelle)

### P0 - Impact maximal / court terme

1. **Forcer ElevenLabs quand la cle est disponible**
   - Eviter le fallback navigateur sauf erreur reseau.
   - Afficher un warning visible quand on est en mode fallback.

2. **Expose les reglages de prosodie dans l'UI**
   - `stability`, `style`, `similarity_boost`, `rate`, `pitch`.
   - Ajouter des presets: `calme`, `empathique`, `energique`, `rassurant`.

3. **Post-traitement de texte pour mieux piloter la voix**
   - Segmenter les phrases longues.
   - Inserer ponctuation/pause (`...`, `,`) pour casser le rendu monotone.

### P1 - Fort potentiel qualite emotionnelle

4. **Classifier l'emotion du texte avant synthese**
   - Exemple d'etiquettes: `triste`, `stresse`, `colere`, `joie`, `neutre`.
   - Mapper emotion -> preset voix.

5. **Ajouter plusieurs fournisseurs TTS**
   - Azure Neural Voice / Google Cloud TTS / OpenAI TTS.
   - A/B test automatique pour comparer naturel et latence.

6. **Memoire contextuelle courte**
   - Conserver les 3-5 derniers tours pour adapter l'intonation.
   - Exemple: ton plus doux si plusieurs messages consecutifs "tristes".

### P2 - Version produit

7. **Mesure de qualite voix**
   - Formulaire de rating "naturel / chaleur / clarte".
   - Dashboard simple pour suivre l'amelioration.

8. **Streaming audio**
   - Jouer la voix plus tot (latence percue plus faible).
   - Important pour l'effet "conversation vivante".

## Plan d'action concret (prochaine iteration)

1. Ajouter presets emotionnels + sliders dans `js/app.js`.
2. Implementer un mapping `emotion -> voice settings`.
3. Ajouter un bandeau "Mode fallback robotique" quand ElevenLabs est inactif.
4. Tester 20 phrases FR/EN et noter la qualite.

## Notes techniques

- L'app fonctionne mieux sur Chrome (support SpeechRecognition).
- La cle ElevenLabs est stockee localement dans `localStorage`.
- Le projet est volontairement simple (front seul, pas de backend).
