export type SpanishDeck = "vocabulary" | "phrases" | "verbs" | "travel" | "slang";

export type SpanishCard = {
  id: string;
  deck: SpanishDeck;
  english: string;
  spanish: string;
  note?: string;
  example: string;
  exampleEnglish: string;
};

export const spanishCards: SpanishCard[] = [
  { id: "hola", deck: "vocabulary", english: "hello", spanish: "hola", note: "The h is always silent.", example: "¡Hola! ¿Cómo estás?", exampleEnglish: "Hi! How are you?" },
  { id: "buenos-dias", deck: "vocabulary", english: "good morning", spanish: "buenos días", note: "Use until about noon, then switch to buenas tardes.", example: "Buenos días, señora Ramírez.", exampleEnglish: "Good morning, Mrs. Ramírez." },
  { id: "agua", deck: "vocabulary", english: "water", spanish: "el agua", note: "Feminine, but singular agua takes el to avoid two stressed a sounds: el agua fría.", example: "¿Me regala un vaso de agua?", exampleEnglish: "Could I have a glass of water?" },
  { id: "casa", deck: "vocabulary", english: "house / home", spanish: "la casa", example: "Mi casa es tu casa.", exampleEnglish: "My house is your house." },
  { id: "carro", deck: "vocabulary", english: "car", spanish: "el carro", note: "Mexico and most of Latin America say carro; Argentina says auto and Spain says coche.", example: "Dejé el carro en el estacionamiento.", exampleEnglish: "I left the car in the parking lot." },
  { id: "celular", deck: "vocabulary", english: "cell phone", spanish: "el celular", note: "Spain says el móvil.", example: "Se me olvidó el celular en la casa.", exampleEnglish: "I left my phone at home." },
  { id: "computadora", deck: "vocabulary", english: "computer", spanish: "la computadora", note: "Colombia says el computador; Spain says el ordenador.", example: "Trabajo en la computadora todo el día.", exampleEnglish: "I work on the computer all day." },
  { id: "jugo", deck: "vocabulary", english: "juice", spanish: "el jugo", note: "Spain says el zumo.", example: "Un jugo de naranja, por favor.", exampleEnglish: "An orange juice, please." },
  { id: "amigo", deck: "vocabulary", english: "friend", spanish: "el amigo / la amiga", example: "Ella es mi mejor amiga.", exampleEnglish: "She is my best friend." },
  { id: "familia", deck: "vocabulary", english: "family", spanish: "la familia", example: "Mi familia vive en Guadalajara.", exampleEnglish: "My family lives in Guadalajara." },
  { id: "comida", deck: "vocabulary", english: "food / lunch", spanish: "la comida", note: "In Mexico, la comida is also the big midday meal, usually eaten between 2 and 4 p.m.", example: "La comida ya está lista.", exampleEnglish: "Lunch is ready." },
  { id: "dinero", deck: "vocabulary", english: "money", spanish: "el dinero", note: "Casually, Mexicans say la lana; much of South America says la plata.", example: "No traigo mucho dinero.", exampleEnglish: "I'm not carrying much money." },
  { id: "trabajo", deck: "vocabulary", english: "work / job", spanish: "el trabajo", example: "Voy al trabajo en metro.", exampleEnglish: "I go to work by subway." },
  { id: "ciudad", deck: "vocabulary", english: "city", spanish: "la ciudad", example: "La Ciudad de México es enorme.", exampleEnglish: "Mexico City is huge." },
  { id: "calle", deck: "vocabulary", english: "street", spanish: "la calle", note: "In Latin America, ll sounds like the y in yes.", example: "Vivo en esta calle.", exampleEnglish: "I live on this street." },
  { id: "libro", deck: "vocabulary", english: "book", spanish: "el libro", example: "Estoy leyendo un libro muy bueno.", exampleEnglish: "I'm reading a really good book." },
  { id: "dia", deck: "vocabulary", english: "day", spanish: "el día", note: "Masculine even though it ends in -a.", example: "¡Que tengas un buen día!", exampleEnglish: "Have a good day!" },
  { id: "noche", deck: "vocabulary", english: "night", spanish: "la noche", example: "Buenas noches, hasta mañana.", exampleEnglish: "Good night, see you tomorrow." },
  { id: "tiempo", deck: "vocabulary", english: "time / weather", spanish: "el tiempo", note: "For clock time, use la hora: ¿Qué hora es?", example: "Hoy no tengo tiempo.", exampleEnglish: "I don't have time today." },
  { id: "bonito", deck: "vocabulary", english: "pretty / nice", spanish: "bonito / bonita", example: "¡Qué bonito día!", exampleEnglish: "What a nice day!" },
  { id: "grande", deck: "vocabulary", english: "big", spanish: "grande", example: "Es una casa muy grande.", exampleEnglish: "It's a very big house." },
  { id: "chico", deck: "vocabulary", english: "small", spanish: "chico / pequeño", note: "Mexicans often say chico or chiquito for small sizes.", example: "Un café chico, por favor.", exampleEnglish: "A small coffee, please." },
  { id: "contento", deck: "vocabulary", english: "happy", spanish: "contento / contenta", note: "Use estar: Estoy contento.", example: "Estoy muy contenta hoy.", exampleEnglish: "I'm very happy today." },
  { id: "cansado", deck: "vocabulary", english: "tired", spanish: "cansado / cansada", example: "Estoy cansado después del trabajo.", exampleEnglish: "I'm tired after work." },

  { id: "como-estas", deck: "phrases", english: "How are you?", spanish: "¿Cómo estás?", note: "Formal: ¿Cómo está usted?", example: "Hola, Ana, ¿cómo estás?", exampleEnglish: "Hi, Ana, how are you?" },
  { id: "mucho-gusto", deck: "phrases", english: "Nice to meet you.", spanish: "Mucho gusto.", note: "A common reply is: Igualmente.", example: "Mucho gusto, me llamo Carlos.", exampleEnglish: "Nice to meet you, my name is Carlos." },
  { id: "como-te-llamas", deck: "phrases", english: "What's your name?", spanish: "¿Cómo te llamas?", note: "Formal: ¿Cómo se llama usted?", example: "¿Cómo te llamas? Yo me llamo Sofía.", exampleEnglish: "What's your name? My name is Sofía." },
  { id: "por-favor", deck: "phrases", english: "please", spanish: "por favor", example: "Dos tacos al pastor, por favor.", exampleEnglish: "Two al pastor tacos, please." },
  { id: "muchas-gracias", deck: "phrases", english: "Thank you very much.", spanish: "Muchas gracias.", example: "Muchas gracias por todo.", exampleEnglish: "Thank you so much for everything." },
  { id: "de-nada", deck: "phrases", english: "You're welcome.", spanish: "De nada.", note: "You'll also hear Por nada and, in shops, A sus órdenes.", example: "—Gracias. —De nada, para servirle.", exampleEnglish: "—Thanks. —You're welcome, happy to help." },
  { id: "disculpe", deck: "phrases", english: "Excuse me (to get attention)", spanish: "Disculpe.", note: "Say Con permiso when you need to pass by someone.", example: "Disculpe, ¿dónde está el baño?", exampleEnglish: "Excuse me, where is the restroom?" },
  { id: "mande", deck: "phrases", english: "Pardon? / Sorry?", spanish: "¿Mande?", note: "A very Mexican, polite way to ask someone to repeat or to answer when called.", example: "¿Mande? No le escuché bien.", exampleEnglish: "Pardon? I didn't hear you well." },
  { id: "no-entiendo", deck: "phrases", english: "I don't understand.", spanish: "No entiendo.", example: "Perdón, no entiendo. ¿Puede repetir, por favor?", exampleEnglish: "Sorry, I don't understand. Can you repeat, please?" },
  { id: "mas-despacio", deck: "phrases", english: "More slowly, please.", spanish: "Más despacio, por favor.", example: "¿Puede hablar más despacio, por favor?", exampleEnglish: "Can you speak more slowly, please?" },
  { id: "cuanto-cuesta", deck: "phrases", english: "How much does it cost?", spanish: "¿Cuánto cuesta?", note: "In markets you'll also hear ¿Cuánto es?", example: "¿Cuánto cuesta esta playera?", exampleEnglish: "How much is this T-shirt?" },
  { id: "quisiera", deck: "phrases", english: "I would like…", spanish: "Quisiera…", note: "Softer and more polite than quiero.", example: "Quisiera una mesa para dos.", exampleEnglish: "I'd like a table for two." },
  { id: "me-da", deck: "phrases", english: "Can I have…? (ordering)", spanish: "¿Me da…?", note: "The everyday way to order in Mexico; ¿Me regala…? is common in Colombia.", example: "¿Me da un agua de jamaica?", exampleEnglish: "Can I have a hibiscus water?" },
  { id: "claro", deck: "phrases", english: "Of course!", spanish: "¡Claro que sí!", example: "¡Claro que sí! Con mucho gusto.", exampleEnglish: "Of course! With pleasure." },
  { id: "no-hay-problema", deck: "phrases", english: "No problem.", spanish: "No hay problema.", example: "No hay problema, nos vemos mañana.", exampleEnglish: "No problem, see you tomorrow." },
  { id: "nos-vemos", deck: "phrases", english: "See you!", spanish: "¡Nos vemos!", note: "The most natural goodbye among friends.", example: "¡Nos vemos el lunes!", exampleEnglish: "See you on Monday!" },
  { id: "cuidate", deck: "phrases", english: "Take care.", spanish: "Cuídate.", example: "Cuídate mucho, ¡bye!", exampleEnglish: "Take care, bye!" },
  { id: "buen-provecho", deck: "phrases", english: "Enjoy your meal.", spanish: "¡Buen provecho!", note: "Said to anyone eating—even strangers as you leave a restaurant.", example: "¡Buen provecho! Que lo disfruten.", exampleEnglish: "Enjoy your meal! Have a good one." },
  { id: "ahorita", deck: "phrases", english: "right now / in a little bit", spanish: "ahorita", note: "In Mexico, ahorita can mean right now or sometime later—tone and context decide.", example: "Ahorita lo hago.", exampleEnglish: "I'll do it in a bit." },
  { id: "vamonos", deck: "phrases", english: "Let's go!", spanish: "¡Vámonos!", example: "¡Vámonos, ya es tarde!", exampleEnglish: "Let's go, it's already late!" },

  { id: "ser", deck: "verbs", english: "to be (identity, origin)", spanish: "ser", note: "Who or what something is: soy, eres, es, somos, son.", example: "Soy de Monterrey.", exampleEnglish: "I'm from Monterrey." },
  { id: "estar", deck: "verbs", english: "to be (state, location)", spanish: "estar", note: "How or where something is: estoy, estás, está, estamos, están.", example: "Estamos en el centro.", exampleEnglish: "We're downtown." },
  { id: "tener", deck: "verbs", english: "to have", spanish: "tener", note: "Also used for age and feelings: Tengo hambre.", example: "Tengo veintiocho años.", exampleEnglish: "I'm twenty-eight years old." },
  { id: "ir", deck: "verbs", english: "to go", spanish: "ir", note: "Ir a + infinitive is the everyday future: Voy a comer.", example: "Vamos a la playa este fin de semana.", exampleEnglish: "We're going to the beach this weekend." },
  { id: "hacer", deck: "verbs", english: "to do / make", spanish: "hacer", note: "Also for weather: Hace calor.", example: "¿Qué vas a hacer hoy?", exampleEnglish: "What are you going to do today?" },
  { id: "querer", deck: "verbs", english: "to want / love", spanish: "querer", note: "Te quiero is the everyday way to say I love you to friends and family.", example: "Quiero aprender a cocinar mole.", exampleEnglish: "I want to learn to cook mole." },
  { id: "poder", deck: "verbs", english: "to be able to / can", spanish: "poder", example: "¿Puedes ayudarme, por favor?", exampleEnglish: "Can you help me, please?" },
  { id: "hablar", deck: "verbs", english: "to speak", spanish: "hablar", example: "Hablo un poco de español.", exampleEnglish: "I speak a little Spanish." },
  { id: "comer", deck: "verbs", english: "to eat", spanish: "comer", example: "Comemos a las tres.", exampleEnglish: "We eat at three." },
  { id: "vivir", deck: "verbs", english: "to live", spanish: "vivir", example: "Vivo cerca del Zócalo.", exampleEnglish: "I live near the Zócalo." },
  { id: "gustar", deck: "verbs", english: "to like (to please)", spanish: "gustar", note: "The thing liked is the subject: Me gusta el café. Me gustan los tacos.", example: "Me gustan mucho los tacos de canasta.", exampleEnglish: "I really like basket tacos." },
  { id: "platicar", deck: "verbs", english: "to chat", spanish: "platicar", note: "The usual word in Mexico and Central America; elsewhere you'll hear charlar or conversar.", example: "Me encanta platicar contigo.", exampleEnglish: "I love chatting with you." },
  { id: "manejar", deck: "verbs", english: "to drive", spanish: "manejar", note: "Spain says conducir.", example: "No me gusta manejar en el tráfico.", exampleEnglish: "I don't like driving in traffic." },
  { id: "tomar", deck: "verbs", english: "to take / drink", spanish: "tomar", note: "In Latin America tomar is the go-to verb for drinking and for taking transport.", example: "Vamos a tomar un café.", exampleEnglish: "Let's grab a coffee." },
  { id: "salir", deck: "verbs", english: "to leave / go out", spanish: "salir", note: "Irregular yo form: salgo.", example: "Salgo del trabajo a las seis.", exampleEnglish: "I leave work at six." },
  { id: "saber", deck: "verbs", english: "to know (facts, how to)", spanish: "saber", note: "Use conocer for people and places. Irregular yo form: sé.", example: "¿Sabes dónde está la parada?", exampleEnglish: "Do you know where the stop is?" },

  { id: "aeropuerto", deck: "travel", english: "airport", spanish: "el aeropuerto", example: "¿Cuánto tarda el taxi al aeropuerto?", exampleEnglish: "How long does the taxi take to the airport?" },
  { id: "central", deck: "travel", english: "bus station", spanish: "la central de autobuses", note: "Long-distance buses are excellent in Mexico; you'll also hear la terminal.", example: "El autobús a Puebla sale de la central del norte.", exampleEnglish: "The bus to Puebla leaves from the north bus station." },
  { id: "camion", deck: "travel", english: "city bus", spanish: "el camión", note: "In Mexico, camión means a city bus. In Spain it only means truck.", example: "Tomo el camión en la esquina.", exampleEnglish: "I take the bus on the corner." },
  { id: "metro", deck: "travel", english: "subway", spanish: "el metro", example: "La estación de metro está a dos cuadras.", exampleEnglish: "The subway station is two blocks away." },
  { id: "boleto", deck: "travel", english: "ticket", spanish: "el boleto", note: "Spain says el billete; in Latin America, billete means a banknote.", example: "Quisiera un boleto redondo a Oaxaca.", exampleEnglish: "I'd like a round-trip ticket to Oaxaca." },
  { id: "reservacion", deck: "travel", english: "reservation", spanish: "la reservación", note: "Spain says la reserva.", example: "Tengo una reservación a nombre de López.", exampleEnglish: "I have a reservation under López." },
  { id: "pasaporte", deck: "travel", english: "passport", spanish: "el pasaporte", example: "Aquí está mi pasaporte.", exampleEnglish: "Here is my passport." },
  { id: "playa", deck: "travel", english: "beach", spanish: "la playa", example: "Las playas de Tulum son increíbles.", exampleEnglish: "The beaches in Tulum are incredible." },
  { id: "mercado", deck: "travel", english: "market", spanish: "el mercado", example: "Compramos fruta en el mercado.", exampleEnglish: "We buy fruit at the market." },
  { id: "cuenta", deck: "travel", english: "the check / bill", spanish: "la cuenta", example: "¿Nos trae la cuenta, por favor?", exampleEnglish: "Could you bring us the check, please?" },
  { id: "bano", deck: "travel", english: "restroom", spanish: "el baño", note: "Signs may say Sanitarios; H or C is for men (hombres/caballeros), M or D for women (mujeres/damas).", example: "¿Dónde están los baños?", exampleEnglish: "Where are the restrooms?" },
  { id: "farmacia", deck: "travel", english: "pharmacy", spanish: "la farmacia", example: "¿Hay una farmacia por aquí?", exampleEnglish: "Is there a pharmacy around here?" },
  { id: "izquierda-derecha", deck: "travel", english: "left / right", spanish: "a la izquierda / a la derecha", example: "Dé vuelta a la derecha en el semáforo.", exampleEnglish: "Turn right at the traffic light." },
  { id: "derecho", deck: "travel", english: "straight ahead", spanish: "todo derecho", note: "Careful: derecho is straight; a la derecha is to the right.", example: "Siga todo derecho dos cuadras.", exampleEnglish: "Keep going straight for two blocks." },
  { id: "centro", deck: "travel", english: "downtown", spanish: "el centro", example: "¿Este camión va al centro?", exampleEnglish: "Does this bus go downtown?" },
  { id: "propina", deck: "travel", english: "tip", spanish: "la propina", note: "Around 10–15% is customary in Mexican restaurants.", example: "¿La propina está incluida?", exampleEnglish: "Is the tip included?" },

  { id: "que-onda", deck: "slang", english: "What's up?", spanish: "¿Qué onda?", note: "Casual greeting among friends. Reply: Nada, aquí nomás.", example: "¿Qué onda? ¿Cómo te fue?", exampleEnglish: "What's up? How did it go?" },
  { id: "chido", deck: "slang", english: "cool", spanish: "chido", note: "Casual and very Mexican. ¡Qué chido! = How cool!", example: "Tu casa está bien chida.", exampleEnglish: "Your house is really cool." },
  { id: "que-padre", deck: "slang", english: "How awesome!", spanish: "¡Qué padre!", note: "Padre means great or awesome here. ¡Padrísimo! is even stronger.", example: "¡Qué padre que vinieron!", exampleEnglish: "How awesome that you came!" },
  { id: "wey", deck: "slang", english: "dude", spanish: "güey", note: "Very casual—only with close friends. Often written wey.", example: "No, güey, no pasa nada.", exampleEnglish: "No, dude, it's fine." },
  { id: "neta", deck: "slang", english: "for real / the truth", spanish: "la neta", note: "¿Neta? = Really? La neta… = Honestly…", example: "La neta, me encantó la película.", exampleEnglish: "Honestly, I loved the movie." },
  { id: "no-manches", deck: "slang", english: "No way!", spanish: "¡No manches!", note: "Friendly disbelief; keep it for informal settings.", example: "¡No manches! ¿Te ganaste la rifa?", exampleEnglish: "No way! You won the raffle?" },
  { id: "chamba", deck: "slang", english: "job / work", spanish: "la chamba", note: "Chambear = to work.", example: "Tengo mucha chamba esta semana.", exampleEnglish: "I have a lot of work this week." },
  { id: "lana", deck: "slang", english: "money", spanish: "la lana", note: "Literally wool. Common across Mexico.", example: "No tengo lana para el concierto.", exampleEnglish: "I don't have money for the concert." },
  { id: "cuate", deck: "slang", english: "buddy / pal", spanish: "el cuate / la cuata", note: "From Nahuatl cóatl. Friendly and safe to use.", example: "Él es mi cuate de la prepa.", exampleEnglish: "He's my buddy from high school." },
  { id: "fresa", deck: "slang", english: "posh / preppy", spanish: "fresa", note: "Literally strawberry—describes someone a bit stuck-up or upscale.", example: "Ese restaurante es muy fresa.", exampleEnglish: "That restaurant is very posh." },
  { id: "andale", deck: "slang", english: "Come on! / That's it!", spanish: "¡Ándale!", note: "Encourages, agrees, or hurries someone along. ¡Ándale pues! = Alright then!", example: "¡Ándale, vamos a llegar tarde!", exampleEnglish: "Come on, we're going to be late!" },
  { id: "orale", deck: "slang", english: "Wow! / OK! / Let's do it!", spanish: "¡Órale!", note: "Can express surprise, agreement, or encouragement depending on tone.", example: "¡Órale! Qué bien te quedó.", exampleEnglish: "Wow! That turned out great." },
  { id: "chela", deck: "slang", english: "a beer", spanish: "una chela", example: "¿Vamos por unas chelas?", exampleEnglish: "Shall we go for some beers?" },
  { id: "aguas", deck: "slang", english: "Watch out!", spanish: "¡Aguas!", note: "A quick warning—shout it if something's about to hit someone.", example: "¡Aguas con el escalón!", exampleEnglish: "Watch out for the step!" },
  { id: "a-poco", deck: "slang", english: "Really? / No kidding?", spanish: "¿A poco?", note: "Expresses surprise or mild disbelief.", example: "¿A poco ya terminaste?", exampleEnglish: "No way, you already finished?" },
  { id: "sale", deck: "slang", english: "OK / deal", spanish: "Sale.", note: "Short for OK, it's a deal. Also: Sale y vale.", example: "—¿Nos vemos a las ocho? —Sale.", exampleEnglish: "—See you at eight? —Deal." },
];

export type RegionalWord = {
  english: string;
  mexico: string;
  colombia: string;
  argentina: string;
  spain: string;
};

export const regionalWords: RegionalWord[] = [
  { english: "city bus", mexico: "camión", colombia: "bus", argentina: "colectivo", spain: "autobús" },
  { english: "car", mexico: "carro", colombia: "carro", argentina: "auto", spain: "coche" },
  { english: "cool", mexico: "chido", colombia: "chévere", argentina: "copado", spain: "guay" },
  { english: "money (slang)", mexico: "lana", colombia: "plata", argentina: "guita", spain: "pasta" },
  { english: "dude", mexico: "güey", colombia: "parce", argentina: "boludo", spain: "tío" },
  { english: "juice", mexico: "jugo", colombia: "jugo", argentina: "jugo", spain: "zumo" },
  { english: "drinking straw", mexico: "popote", colombia: "pitillo", argentina: "sorbete", spain: "pajita" },
  { english: "avocado", mexico: "aguacate", colombia: "aguacate", argentina: "palta", spain: "aguacate" },
  { english: "T-shirt", mexico: "playera", colombia: "camiseta", argentina: "remera", spain: "camiseta" },
  { english: "popcorn", mexico: "palomitas", colombia: "crispetas", argentina: "pochoclo", spain: "palomitas" },
  { english: "computer", mexico: "computadora", colombia: "computador", argentina: "computadora", spain: "ordenador" },
  { english: "cell phone", mexico: "celular", colombia: "celular", argentina: "celular", spain: "móvil" },
  { english: "apartment", mexico: "departamento", colombia: "apartamento", argentina: "departamento", spain: "piso" },
  { english: "to drive", mexico: "manejar", colombia: "manejar", argentina: "manejar", spain: "conducir" },
  { english: "you (informal)", mexico: "tú", colombia: "tú / usted", argentina: "vos", spain: "tú" },
  { english: "you all", mexico: "ustedes", colombia: "ustedes", argentina: "ustedes", spain: "vosotros" },
];
