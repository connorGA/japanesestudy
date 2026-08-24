export type ItalianDeck = "vocabulary" | "phrases" | "verbs" | "travel";

export type ItalianCard = {
  id: string;
  deck: ItalianDeck;
  english: string;
  italian: string;
  note?: string;
  example: string;
  exampleEnglish: string;
};

export const italianCards: ItalianCard[] = [
  { id: "hello", deck: "vocabulary", english: "hello / good day", italian: "buongiorno", note: "Use until the late afternoon.", example: "Buongiorno, come sta?", exampleEnglish: "Good morning, how are you?" },
  { id: "evening", deck: "vocabulary", english: "good evening", italian: "buonasera", example: "Buonasera a tutti!", exampleEnglish: "Good evening, everyone!" },
  { id: "thanks", deck: "vocabulary", english: "thank you", italian: "grazie", example: "Grazie per il caffè.", exampleEnglish: "Thank you for the coffee." },
  { id: "please", deck: "vocabulary", english: "please", italian: "per favore", example: "Un bicchiere d'acqua, per favore.", exampleEnglish: "A glass of water, please." },
  { id: "water", deck: "vocabulary", english: "water", italian: "l'acqua", note: "Feminine noun; the article contracts before a vowel.", example: "L'acqua è fresca.", exampleEnglish: "The water is fresh." },
  { id: "coffee", deck: "vocabulary", english: "coffee", italian: "il caffè", note: "The final accent is stressed.", example: "Prendo un caffè.", exampleEnglish: "I'll have a coffee." },
  { id: "friend", deck: "vocabulary", english: "friend", italian: "l'amico / l'amica", example: "Lei è una mia amica.", exampleEnglish: "She is a friend of mine." },
  { id: "house", deck: "vocabulary", english: "house / home", italian: "la casa", example: "La mia casa è piccola.", exampleEnglish: "My house is small." },
  { id: "today", deck: "vocabulary", english: "today", italian: "oggi", example: "Oggi fa caldo.", exampleEnglish: "It is hot today." },
  { id: "tomorrow", deck: "vocabulary", english: "tomorrow", italian: "domani", example: "Ci vediamo domani.", exampleEnglish: "We'll see each other tomorrow." },
  { id: "beautiful", deck: "vocabulary", english: "beautiful", italian: "bello / bella", example: "Che bella città!", exampleEnglish: "What a beautiful city!" },
  { id: "book", deck: "vocabulary", english: "book", italian: "il libro", example: "Leggo un libro italiano.", exampleEnglish: "I am reading an Italian book." },

  { id: "how-are-you", deck: "phrases", english: "How are you?", italian: "Come stai?", note: "Informal singular. Use Come sta? formally.", example: "Ciao, Luca! Come stai?", exampleEnglish: "Hi, Luca! How are you?" },
  { id: "name", deck: "phrases", english: "My name is…", italian: "Mi chiamo…", example: "Mi chiamo Sofia.", exampleEnglish: "My name is Sofia." },
  { id: "pleased", deck: "phrases", english: "Nice to meet you", italian: "Piacere", example: "Piacere, io sono Marco.", exampleEnglish: "Nice to meet you, I'm Marco." },
  { id: "dont-understand", deck: "phrases", english: "I don't understand", italian: "Non capisco", example: "Scusi, non capisco.", exampleEnglish: "Excuse me, I don't understand." },
  { id: "repeat", deck: "phrases", english: "Could you repeat?", italian: "Può ripetere?", note: "Polite form. Puoi ripetere? is informal.", example: "Può ripetere più lentamente?", exampleEnglish: "Could you repeat more slowly?" },
  { id: "how-much", deck: "phrases", english: "How much does it cost?", italian: "Quanto costa?", example: "Quanto costa questo libro?", exampleEnglish: "How much does this book cost?" },
  { id: "where", deck: "phrases", english: "Where is…?", italian: "Dov'è…?", example: "Dov'è il bagno?", exampleEnglish: "Where is the bathroom?" },
  { id: "would-like", deck: "phrases", english: "I would like…", italian: "Vorrei…", note: "A polite and useful conditional form.", example: "Vorrei una pizza margherita.", exampleEnglish: "I would like a margherita pizza." },

  { id: "be", deck: "verbs", english: "to be", italian: "essere", note: "sono, sei, è, siamo, siete, sono", example: "Siamo pronti.", exampleEnglish: "We are ready." },
  { id: "have", deck: "verbs", english: "to have", italian: "avere", note: "ho, hai, ha, abbiamo, avete, hanno", example: "Ho una domanda.", exampleEnglish: "I have a question." },
  { id: "go", deck: "verbs", english: "to go", italian: "andare", note: "vado, vai, va, andiamo, andate, vanno", example: "Andiamo al mercato.", exampleEnglish: "We are going to the market." },
  { id: "do", deck: "verbs", english: "to do / make", italian: "fare", note: "faccio, fai, fa, facciamo, fate, fanno", example: "Faccio colazione alle otto.", exampleEnglish: "I eat breakfast at eight." },
  { id: "speak", deck: "verbs", english: "to speak", italian: "parlare", note: "Regular -are verb.", example: "Parlo un po' d'italiano.", exampleEnglish: "I speak a little Italian." },
  { id: "take", deck: "verbs", english: "to take / have", italian: "prendere", note: "Regular -ere pattern with several idiomatic uses.", example: "Prendo il treno.", exampleEnglish: "I take the train." },
  { id: "sleep", deck: "verbs", english: "to sleep", italian: "dormire", note: "Regular -ire verb.", example: "Dormo otto ore.", exampleEnglish: "I sleep eight hours." },
  { id: "understand", deck: "verbs", english: "to understand", italian: "capire", note: "An -isc- verb: capisco, capisci, capisce…", example: "Capisco la domanda.", exampleEnglish: "I understand the question." },

  { id: "station", deck: "travel", english: "train station", italian: "la stazione", example: "La stazione è vicina.", exampleEnglish: "The station is nearby." },
  { id: "ticket", deck: "travel", english: "ticket", italian: "il biglietto", example: "Un biglietto per Roma, per favore.", exampleEnglish: "A ticket to Rome, please." },
  { id: "platform", deck: "travel", english: "platform / track", italian: "il binario", example: "Il treno parte dal binario cinque.", exampleEnglish: "The train leaves from platform five." },
  { id: "reservation", deck: "travel", english: "reservation", italian: "la prenotazione", example: "Ho una prenotazione a nome Rossi.", exampleEnglish: "I have a reservation under the name Rossi." },
  { id: "menu", deck: "travel", english: "menu", italian: "il menù", example: "Possiamo vedere il menù?", exampleEnglish: "Can we see the menu?" },
  { id: "bill", deck: "travel", english: "the bill / check", italian: "il conto", example: "Il conto, per favore.", exampleEnglish: "The bill, please." },
  { id: "left", deck: "travel", english: "to the left", italian: "a sinistra", example: "Giri a sinistra.", exampleEnglish: "Turn left." },
  { id: "right", deck: "travel", english: "to the right", italian: "a destra", example: "Il museo è a destra.", exampleEnglish: "The museum is on the right." },
];
