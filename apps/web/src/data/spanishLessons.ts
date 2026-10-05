export const pronunciationGroups = [
  { title: "Five pure vowels", pattern: "a · e · i · o · u", explanation: "Spanish has just five vowel sounds, always short and crisp. Never glide them the way English does with day or go.", examples: ["casa", "mesa", "piso", "todo", "luna"] },
  { title: "Seseo: C, Z, and S", pattern: "ce · ci · z = s", explanation: "Across Latin America, z and soft c sound exactly like s. The lisped th you may hear in Spain is not used in Mexico.", examples: ["cerveza", "zapato", "cine", "gracias", "plaza"] },
  { title: "Tap R and trilled RR", pattern: "pero ≠ perro", explanation: "A single r between vowels is a quick tongue tap, like the tt in butter. Rr—and an r at the start of a word—is a rolled trill.", examples: ["pero", "perro", "caro", "carro", "rojo", "arroz"] },
  { title: "J and soft G", pattern: "j · ge · gi", explanation: "These are a breathy h from the back of the throat. In Mexico it's softer than in Spain—think of a strong English h.", examples: ["jugo", "joven", "gente", "girasol", "ojo"] },
  { title: "The X of Mexico", pattern: "x = h · s · sh · ks", explanation: "Thanks to Nahuatl and Maya, x has four sounds. México and Oaxaca use the j sound, Xochimilco uses s, Xcaret uses sh, and taxi uses ks.", examples: ["México", "Oaxaca", "Xochimilco", "Xcaret", "taxi", "éxito"] },
  { title: "LL and Y (yeísmo)", pattern: "ll = y", explanation: "In Mexico, ll and y sound the same, like the y in yes. In Argentina and Uruguay you'll hear them as sh instead.", examples: ["llamar", "calle", "yo", "pollo", "playa"] },
  { title: "Ñ", pattern: "ñ = ny", explanation: "Ñ sounds like the ny in canyon. It's a separate letter, so año and ano are different words.", examples: ["niño", "mañana", "año", "español", "piñata"] },
  { title: "B and V are twins", pattern: "b = v", explanation: "B and v are pronounced identically. At the start they're a full b; between vowels, the lips barely touch.", examples: ["vamos", "bueno", "vaca", "uva", "nube"] },
  { title: "Silent H and CH", pattern: "h = silent · ch", explanation: "H is always silent. Ch is the same as in English church.", examples: ["hola", "hora", "ahora", "chocolate", "mucho"] },
  { title: "Stress and accent marks", pattern: "papá · papa", explanation: "Words ending in a vowel, n, or s stress the second-to-last syllable; others stress the last. A written accent overrides the rule.", examples: ["papá", "papa", "médico", "inglés", "canción", "teléfono"] },
];

export type Tense = "present" | "preterite" | "future";
export type VerbForms = [string, string, string, string, string];
export type SpanishVerb = {
  infinitive: string;
  english: string;
  group: string;
  present: VerbForms;
  preterite: VerbForms;
  examples: Record<Tense, string>;
};

export const tenses: { id: Tense; label: string; spanish: string; hint: string }[] = [
  { id: "present", label: "Present", spanish: "Presente", hint: "Habits, facts, and what's happening now." },
  { id: "preterite", label: "Preterite", spanish: "Pretérito", hint: "Completed actions at a specific time in the past." },
  { id: "future", label: "Ir a + infinitive", spanish: "Futuro próximo", hint: "The go-to future in Mexico: voy a + verb." },
];

export const verbPronouns = ["yo", "tú", "él / ella / usted", "nosotros", "ellos / ellas / ustedes"];
const goingTo = ["voy a", "vas a", "va a", "vamos a", "van a"];

export const spanishVerbs: SpanishVerb[] = [
  { infinitive: "hablar", english: "to speak", group: "-ar", present: ["hablo", "hablas", "habla", "hablamos", "hablan"], preterite: ["hablé", "hablaste", "habló", "hablamos", "hablaron"], examples: { present: "Hablo español con mis vecinos.", preterite: "Ayer hablé con mi abuela.", future: "Vamos a hablar mañana." } },
  { infinitive: "comer", english: "to eat", group: "-er", present: ["como", "comes", "come", "comemos", "comen"], preterite: ["comí", "comiste", "comió", "comimos", "comieron"], examples: { present: "Comemos a las tres de la tarde.", preterite: "Comí tacos de pescado en Ensenada.", future: "¿Vas a comer con nosotros?" } },
  { infinitive: "vivir", english: "to live", group: "-ir", present: ["vivo", "vives", "vive", "vivimos", "viven"], preterite: ["viví", "viviste", "vivió", "vivimos", "vivieron"], examples: { present: "Vivo en la colonia Roma.", preterite: "Vivieron dos años en Mérida.", future: "Voy a vivir en Monterrey." } },
  { infinitive: "ser", english: "to be (identity)", group: "irregular", present: ["soy", "eres", "es", "somos", "son"], preterite: ["fui", "fuiste", "fue", "fuimos", "fueron"], examples: { present: "Somos de Guadalajara.", preterite: "La fiesta fue increíble.", future: "Va a ser un gran día." } },
  { infinitive: "estar", english: "to be (state, place)", group: "irregular", present: ["estoy", "estás", "está", "estamos", "están"], preterite: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvieron"], examples: { present: "¿Dónde estás?", preterite: "Estuve en Oaxaca la semana pasada.", future: "Voy a estar en casa." } },
  { infinitive: "tener", english: "to have", group: "irregular", present: ["tengo", "tienes", "tiene", "tenemos", "tienen"], preterite: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvieron"], examples: { present: "Tengo dos hermanos.", preterite: "Tuvimos un problema con el vuelo.", future: "Van a tener un bebé." } },
  { infinitive: "ir", english: "to go", group: "irregular", present: ["voy", "vas", "va", "vamos", "van"], preterite: ["fui", "fuiste", "fue", "fuimos", "fueron"], examples: { present: "Voy al mercado los domingos.", preterite: "Fuimos a la playa en diciembre.", future: "Voy a ir al concierto." } },
  { infinitive: "hacer", english: "to do / make", group: "irregular", present: ["hago", "haces", "hace", "hacemos", "hacen"], preterite: ["hice", "hiciste", "hizo", "hicimos", "hicieron"], examples: { present: "¿Qué haces?", preterite: "Hicimos tamales para la posada.", future: "Voy a hacer la tarea." } },
  { infinitive: "querer", english: "to want / love", group: "e → ie", present: ["quiero", "quieres", "quiere", "queremos", "quieren"], preterite: ["quise", "quisiste", "quiso", "quisimos", "quisieron"], examples: { present: "Quiero un café, por favor.", preterite: "Quise llamarte, pero no pude.", future: "Van a querer más salsa." } },
  { infinitive: "poder", english: "can / to be able", group: "o → ue", present: ["puedo", "puedes", "puede", "podemos", "pueden"], preterite: ["pude", "pudiste", "pudo", "pudimos", "pudieron"], examples: { present: "¿Puedes ayudarme?", preterite: "No pudimos entrar al museo.", future: "Vas a poder verlo mañana." } },
  { infinitive: "decir", english: "to say / tell", group: "irregular", present: ["digo", "dices", "dice", "decimos", "dicen"], preterite: ["dije", "dijiste", "dijo", "dijimos", "dijeron"], examples: { present: "¿Cómo se dice en español?", preterite: "Me dijo que sí.", future: "Le voy a decir la verdad." } },
  { infinitive: "venir", english: "to come", group: "irregular", present: ["vengo", "vienes", "viene", "venimos", "vienen"], preterite: ["vine", "viniste", "vino", "vinimos", "vinieron"], examples: { present: "¿Vienes a la fiesta?", preterite: "Vinieron todos mis primos.", future: "Van a venir el sábado." } },
  { infinitive: "saber", english: "to know (facts)", group: "irregular", present: ["sé", "sabes", "sabe", "sabemos", "saben"], preterite: ["supe", "supiste", "supo", "supimos", "supieron"], examples: { present: "No sé dónde está.", preterite: "Supe la noticia ayer.", future: "Vas a saber la respuesta." } },
];

export function verbFormsFor(verb: SpanishVerb, tense: Tense): VerbForms {
  if (tense === "future") return goingTo.map((aux) => `${aux} ${verb.infinitive}`) as VerbForms;
  return verb[tense];
}

export function spokenVerbForm(index: number, form: string) {
  return `${verbPronouns[index].split(" / ")[0]} ${form}`;
}

export const grammarTopics = [
  { title: "Gender & articles", idea: "Every noun is masculine or feminine. Most -o nouns are masculine and most -a nouns are feminine, with a few famous exceptions.", examples: ["el libro", "la casa", "el día", "la mano"], tip: "Learn each noun with its article—el día and la mano break the pattern." },
  { title: "Plurals & agreement", idea: "Add -s after a vowel and -es after a consonant. Articles and adjectives change to match the noun.", examples: ["los tacos ricos", "las ciudades bonitas"], tip: "Adjectives usually come after the noun: una casa grande." },
  { title: "Ser vs estar", idea: "Ser is for identity, origin, time, and events. Estar is for location, feelings, and conditions.", examples: ["Soy de Chicago.", "Estoy en Chicago.", "Estoy feliz."], tip: "Remember: how you feel and where you are always use estar." },
  { title: "Tú, usted, and ustedes", idea: "Use tú with friends and family, usted for respect, and ustedes for every group—formal or casual.", examples: ["¿Cómo estás?", "¿Cómo está usted?", "¿Cómo están ustedes?"], tip: "In Latin America, vosotros is not used. Argentina, Uruguay, and parts of Central America use vos instead of tú." },
  { title: "Gustar & similar verbs", idea: "Gustar works backwards: the thing you like is the subject, so the verb agrees with it.", examples: ["Me gusta el café.", "Me gustan los tacos.", "¿Te gusta bailar?"], tip: "Encantar (to love) and doler (to hurt) work the same way: Me duele la cabeza." },
  { title: "Ir a + infinitive", idea: "The most common way to talk about the future in Mexico is a form of ir, plus a, plus a verb.", examples: ["Voy a comer.", "Vamos a ir a la playa."], tip: "The simple future (comeré) exists, but ir a sounds more natural in conversation." },
  { title: "Por vs para", idea: "Para points to a goal, recipient, or deadline. Por covers cause, exchange, duration, and movement through.", examples: ["Este regalo es para ti.", "Gracias por todo.", "Caminamos por el parque."], tip: "Para = destination or purpose. Por = the reason behind it or the route." },
  { title: "Preterite vs imperfect", idea: "The preterite tells completed events. The imperfect sets the scene and describes habits in the past.", examples: ["Ayer comí tacos.", "De niño, comía tacos cada domingo."], tip: "Preterite moves the story forward; imperfect paints the background." },
  { title: "Object pronouns", idea: "Lo, la, los, and las replace a thing already mentioned. They go before a conjugated verb or attach to an infinitive.", examples: ["¿El boleto? Ya lo compré.", "Voy a comprarlo."], tip: "With two pronouns, le becomes se: Se lo doy." },
  { title: "Diminutives", idea: "Mexicans love -ito and -ita to make things small, cute, polite, or friendly.", examples: ["un cafecito", "ahorita", "cerquita", "un momentito"], tip: "Ahorita and cerquita soften a request. Un momentito sounds warmer than un momento." },
];

export const phraseRounds = [
  { english: "I would like two tacos, please.", tokens: ["tacos", "Quisiera", "favor", "dos", "por"], answer: "Quisiera dos tacos por favor", display: "Quisiera dos tacos, por favor." },
  { english: "Where is the subway station?", tokens: ["la", "metro", "Dónde", "del", "está", "estación"], answer: "Dónde está la estación del metro", display: "¿Dónde está la estación del metro?" },
  { english: "Tomorrow we're going to the market.", tokens: ["al", "Mañana", "mercado", "vamos"], answer: "Mañana vamos al mercado", display: "Mañana vamos al mercado." },
  { english: "I really like Mexican food.", tokens: ["comida", "Me", "mexicana", "mucho", "la", "gusta"], answer: "Me gusta mucho la comida mexicana", display: "Me gusta mucho la comida mexicana." },
  { english: "Can you speak more slowly?", tokens: ["despacio", "Puede", "más", "hablar"], answer: "Puede hablar más despacio", display: "¿Puede hablar más despacio?" },
  { english: "My sister lives in Monterrey.", tokens: ["vive", "Monterrey", "Mi", "en", "hermana"], answer: "Mi hermana vive en Monterrey", display: "Mi hermana vive en Monterrey." },
  { english: "The check, please.", tokens: ["favor", "La", "por", "cuenta"], answer: "La cuenta por favor", display: "La cuenta, por favor." },
  { english: "Today I'm very tired.", tokens: ["muy", "Hoy", "cansado", "estoy"], answer: "Hoy estoy muy cansado", display: "Hoy estoy muy cansado." },
  { english: "What time does the bus leave?", tokens: ["sale", "A", "camión", "qué", "el", "hora"], answer: "A qué hora sale el camión", display: "¿A qué hora sale el camión?" },
  { english: "Yesterday we ate al pastor tacos.", tokens: ["al", "comimos", "pastor", "Ayer", "tacos"], answer: "Ayer comimos tacos al pastor", display: "Ayer comimos tacos al pastor." },
];

export const serEstarRounds = [
  { sentence: "Mi mamá ___ doctora.", options: ["es", "está"], answer: "es", english: "My mom is a doctor.", why: "Professions are part of identity, so they use ser." },
  { sentence: "Hoy ___ muy cansado.", options: ["soy", "estoy"], answer: "estoy", english: "Today I'm very tired.", why: "Temporary physical states use estar." },
  { sentence: "Nosotros ___ de Puebla.", options: ["somos", "estamos"], answer: "somos", english: "We're from Puebla.", why: "Origin uses ser: ser de + place." },
  { sentence: "El museo ___ en el centro.", options: ["es", "está"], answer: "está", english: "The museum is downtown.", why: "The location of a thing or person uses estar." },
  { sentence: "La fiesta ___ en mi casa.", options: ["es", "está"], answer: "es", english: "The party is at my house.", why: "Tricky one! Where an event takes place uses ser." },
  { sentence: "¿Cómo ___ tu familia?", options: ["es", "está"], answer: "está", english: "How is your family doing?", why: "Asking how someone is doing uses estar. ¿Cómo es? asks what they're like." },
  { sentence: "___ las cinco de la tarde.", options: ["Son", "Están"], answer: "Son", english: "It's five in the afternoon.", why: "Telling time always uses ser." },
  { sentence: "Mi hermano ___ alto y moreno.", options: ["es", "está"], answer: "es", english: "My brother is tall and dark-haired.", why: "Inherent physical descriptions use ser." },
  { sentence: "La sopa ___ fría.", options: ["es", "está"], answer: "está", english: "The soup is cold.", why: "A current condition uses estar." },
  { sentence: "Ellos ___ estudiando español.", options: ["son", "están"], answer: "están", english: "They're studying Spanish.", why: "The progressive (-ando / -iendo) always uses estar." },
  { sentence: "Este carro ___ de mi papá.", options: ["es", "está"], answer: "es", english: "This car is my dad's.", why: "Possession uses ser de." },
  { sentence: "¡Qué guapa ___ hoy!", options: ["eres", "estás"], answer: "estás", english: "You look so pretty today!", why: "Estar describes how someone looks at a particular moment." },
  { sentence: "El concierto ___ el sábado.", options: ["es", "está"], answer: "es", english: "The concert is on Saturday.", why: "Dates and event times use ser." },
  { sentence: "___ muy contenta con mi trabajo.", options: ["Soy", "Estoy"], answer: "Estoy", english: "I'm very happy with my job.", why: "Emotions and moods use estar." },
  { sentence: "La comida ya ___ lista.", options: ["es", "está"], answer: "está", english: "The food is ready now.", why: "Estar listo means to be ready." },
  { sentence: "Tu hija ___ muy lista.", options: ["es", "está"], answer: "es", english: "Your daughter is very clever.", why: "Ser listo means to be clever—the verb changes the meaning!" },
];

export function filledSerEstar(round: (typeof serEstarRounds)[number]) {
  return round.sentence.replace("___", round.answer);
}
