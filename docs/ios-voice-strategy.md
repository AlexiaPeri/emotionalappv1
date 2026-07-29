# Stratégie vocale iPhone

## Statut

Cette page est la source de vérité pour l'architecture vocale de l'app iPhone.

La décision finale entre Apple SpeechAnalyzer et Deepgram Flux n'est pas encore prise. Elle doit venir d'un test comparatif sur de vrais iPhone, pas d'une préférence théorique.

## Besoin produit

Emerge utilise une répétition inspirée de Meisner et centrée sur l'utilisateur :

1. L'utilisateur prononce une phrase courte qui exprime son émotion.
2. L'app détecte qu'il a fini de parler.
3. Elle reconnaît ses mots sans les interpréter.
4. Elle transforme les pronoms quand nécessaire.
5. Une voix calme répète immédiatement la phrase.
6. L'app reprend l'écoute pour permettre la répétition suivante.

L'expérience doit être rapide, fluide, naturelle et fiable pendant des sessions de 12 à 60 minutes.

## Architecture commune

Quel que soit le moteur de reconnaissance retenu :

- L'interface sera native en SwiftUI.
- AVAudioSession et AVAudioEngine géreront le microphone et le cycle audio.
- La transformation FR/EN restera locale, déterministe et couverte par des tests.
- AVSpeechSynthesizer utilisera une voix iPhone Enhanced ou Premium pour la répétition.
- Les openings, closings et guidances de support utiliseront la voix préenregistrée d'Alexia.
- La machine d'état sera explicite : écoute → fin de tour → transformation → répétition → reprise.
- L'app ne devra jamais transcrire sa propre voix de répétition.
- Toute navigation hors d'une guidance devra arrêter immédiatement son audio.
- Les interruptions, changements de sortie audio et pertes de connexion devront être récupérés proprement.

## Candidat A : Apple SpeechAnalyzer

Points forts :

- transcription sur l'appareil ;
- pas de coût par session ;
- pas de dépendance au réseau ;
- confidentialité renforcée ;
- conçu pour la transcription conversationnelle, longue et à faible latence.

Points à vérifier :

- disponibilité réelle sur chaque modèle d'iPhone ;
- disponibilité et qualité des modèles français et anglais ;
- qualité du découpage après des silences émotionnels ;
- stabilité et consommation pendant 60 minutes.

L'app devra vérifier à l'exécution :

```swift
SpeechTranscriber.isAvailable
SpeechTranscriber.supportedLocales
```

## Candidat B : Deepgram Flux

Points forts :

- modèle pensé pour les interactions vocales en temps réel ;
- français et anglais pris en charge par Flux Multilingual ;
- détection native et configurable de début, reprise et fin de tour ;
- seuils adaptables aux utilisateurs qui parlent avec des pauses longues.

Points à vérifier :

- latence réelle selon le réseau ;
- stabilité du WebSocket pendant 60 minutes ;
- comportement lors du passage Wi-Fi ↔ réseau mobile ;
- coût et confidentialité des flux audio.

Si Deepgram est retenu :

- utiliser une connexion streaming ;
- maintenir la connexion selon les recommandations Deepgram ;
- utiliser l'endpoint européen quand cela est pertinent ;
- conserver la clé secrète uniquement sur un backend ;
- fournir à l'app un jeton temporaire au début de la connexion.

## Pourquoi ne pas utiliser un LLM

La transformation `je → tu` / `I → you` ne doit pas reformuler, expliquer ou atténuer ce que l'utilisateur vient de dire. Un moteur déterministe est plus rapide, testable et prévisible.

Le guide demande déjà des phrases simples. Le moteur doit donc couvrir précisément les constructions fréquentes en français et en anglais, puis être enrichi à partir d'un corpus de tests réaliste.

## Protocole de comparaison

Les deux prototypes doivent avoir la même interface, le même moteur de pronoms et la même voix de répétition.

Tester au minimum :

- 50 phrases françaises et 50 phrases anglaises ;
- parole lente, rapide, basse et chargée émotionnellement ;
- pauses courtes et longues au milieu des phrases ;
- haut-parleur, écouteurs filaires et Bluetooth ;
- Wi-Fi et réseau mobile ;
- interruptions par appel, alarme et changement de route audio ;
- une session continue de 60 minutes.

Mesurer :

- délai entre la fin de la phrase et le début de la répétition ;
- précision sémantique de la transcription ;
- nombre de phrases coupées trop tôt ;
- nombre de reprises manquées ;
- nombre de déconnexions ou arrêts silencieux ;
- consommation de batterie ;
- qualité subjective de la fluidité.

La solution retenue doit avoir zéro arrêt silencieux pendant le test d'endurance. Les seuils de latence et de précision seront fixés après les premiers essais réels.

## Cible bêta

- iPhone 15 ou plus récent.
- iOS 26 ou plus récent.
- Français et anglais.
- Internet requis pendant la première bêta.
- Vérification dynamique de la disponibilité d'Apple SpeechTranscriber.

L'alpha technique doit inclure :

- un iPhone 15 ou 15 Plus ;
- un iPhone 15 Pro ou 15 Pro Max ;
- un iPhone 16 ou plus récent.

Cette base pourra être élargie après validation. Deepgram peut permettre de prendre en charge des appareils sur lesquels SpeechAnalyzer n'est pas disponible ou pas assez performant.

## Références officielles

- [Apple SpeechAnalyzer](https://developer.apple.com/documentation/speech/speechanalyzer)
- [Apple SpeechTranscriber](https://developer.apple.com/documentation/speech/speechtranscriber)
- [Apple AVSpeechSynthesizer](https://developer.apple.com/documentation/avfaudio/avspeechsynthesizer)
- [Deepgram Flux Multilingual](https://developers.deepgram.com/docs/flux/language-prompting)
- [Deepgram Flux : fin de tour](https://developers.deepgram.com/docs/flux/configuration)
- [Deepgram : authentification par jeton](https://developers.deepgram.com/guides/fundamentals/token-based-authentication)
