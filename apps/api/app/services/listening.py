from pydantic import BaseModel


class ListeningLineSeed(BaseModel):
    speaker: str
    japanese: str
    romaji: str
    english: str


class ListeningScenarioSeed(BaseModel):
    id: str
    title: str
    description: str
    level: str = "Beginner"
    setting: str
    lines: list[ListeningLineSeed]


LISTENING_SCENARIOS = [
    ListeningScenarioSeed(
        id="first-greeting",
        title="First greeting",
        description="A simple greeting between two people.",
        setting="School hallway",
        lines=[
            ListeningLineSeed(speaker="A", japanese="こんにちは。", romaji="Konnichiwa.", english="Hello."),
            ListeningLineSeed(speaker="B", japanese="こんにちは。", romaji="Konnichiwa.", english="Hello."),
            ListeningLineSeed(speaker="A", japanese="おげんきですか。", romaji="Ogenki desu ka.", english="How are you?"),
            ListeningLineSeed(speaker="B", japanese="はい、げんきです。", romaji="Hai, genki desu.", english="Yes, I'm well."),
        ],
    ),
    ListeningScenarioSeed(
        id="introducing-yourself",
        title="Introducing yourself",
        description="Name, nationality, and a polite closing.",
        setting="Classroom",
        lines=[
            ListeningLineSeed(speaker="A", japanese="はじめまして。", romaji="Hajimemashite.", english="Nice to meet you."),
            ListeningLineSeed(speaker="A", japanese="わたしはコナーです。", romaji="Watashi wa Konaa desu.", english="I am Connor."),
            ListeningLineSeed(speaker="B", japanese="アメリカじんですか。", romaji="Amerika-jin desu ka.", english="Are you American?"),
            ListeningLineSeed(speaker="A", japanese="はい、アメリカじんです。", romaji="Hai, Amerika-jin desu.", english="Yes, I am American."),
            ListeningLineSeed(speaker="B", japanese="よろしくおねがいします。", romaji="Yoroshiku onegaishimasu.", english="Nice to meet you."),
        ],
    ),
    ListeningScenarioSeed(
        id="ordering-water",
        title="Ordering water",
        description="Ask for water politely at a restaurant.",
        setting="Restaurant",
        lines=[
            ListeningLineSeed(speaker="Staff", japanese="いらっしゃいませ。", romaji="Irasshaimase.", english="Welcome."),
            ListeningLineSeed(speaker="You", japanese="すみません。", romaji="Sumimasen.", english="Excuse me."),
            ListeningLineSeed(speaker="You", japanese="みずをください。", romaji="Mizu o kudasai.", english="Water, please."),
            ListeningLineSeed(speaker="Staff", japanese="はい、どうぞ。", romaji="Hai, douzo.", english="Yes, here you go."),
            ListeningLineSeed(speaker="You", japanese="ありがとうございます。", romaji="Arigatou gozaimasu.", english="Thank you."),
        ],
    ),
    ListeningScenarioSeed(
        id="at-the-station",
        title="At the station",
        description="Ask where the station is and understand directions.",
        setting="Street",
        lines=[
            ListeningLineSeed(speaker="You", japanese="すみません。", romaji="Sumimasen.", english="Excuse me."),
            ListeningLineSeed(speaker="You", japanese="えきはどこですか。", romaji="Eki wa doko desu ka.", english="Where is the station?"),
            ListeningLineSeed(speaker="Local", japanese="えきはみぎです。", romaji="Eki wa migi desu.", english="The station is to the right."),
            ListeningLineSeed(speaker="You", japanese="ありがとうございます。", romaji="Arigatou gozaimasu.", english="Thank you."),
        ],
    ),
    ListeningScenarioSeed(
        id="shopping-price",
        title="Shopping price",
        description="Ask the price and buy something.",
        setting="Shop",
        lines=[
            ListeningLineSeed(speaker="You", japanese="これはいくらですか。", romaji="Kore wa ikura desu ka.", english="How much is this?"),
            ListeningLineSeed(speaker="Staff", japanese="さんびゃくえんです。", romaji="Sanbyaku en desu.", english="It is 300 yen."),
            ListeningLineSeed(speaker="You", japanese="これをください。", romaji="Kore o kudasai.", english="I'll take this, please."),
            ListeningLineSeed(speaker="Staff", japanese="ありがとうございます。", romaji="Arigatou gozaimasu.", english="Thank you."),
        ],
    ),
    ListeningScenarioSeed(
        id="making-plans",
        title="Making plans",
        description="Make a simple plan with a friend.",
        setting="After class",
        lines=[
            ListeningLineSeed(speaker="A", japanese="あしたひまですか。", romaji="Ashita hima desu ka.", english="Are you free tomorrow?"),
            ListeningLineSeed(speaker="B", japanese="はい、ひまです。", romaji="Hai, hima desu.", english="Yes, I am free."),
            ListeningLineSeed(speaker="A", japanese="カフェにいきませんか。", romaji="Kafe ni ikimasen ka.", english="Do you want to go to a cafe?"),
            ListeningLineSeed(speaker="B", japanese="いいですね。", romaji="Ii desu ne.", english="Sounds good."),
        ],
    ),
    ListeningScenarioSeed(
        id="daily-routine",
        title="Daily routine",
        description="Talk about a very simple morning routine.",
        setting="Home",
        lines=[
            ListeningLineSeed(speaker="A", japanese="あさなんじにおきますか。", romaji="Asa nanji ni okimasu ka.", english="What time do you wake up?"),
            ListeningLineSeed(speaker="B", japanese="しちじにおきます。", romaji="Shichiji ni okimasu.", english="I wake up at seven."),
            ListeningLineSeed(speaker="A", japanese="あさごはんをたべますか。", romaji="Asagohan o tabemasu ka.", english="Do you eat breakfast?"),
            ListeningLineSeed(speaker="B", japanese="はい、たべます。", romaji="Hai, tabemasu.", english="Yes, I do."),
        ],
    ),
    ListeningScenarioSeed(
        id="dont-understand",
        title="When you don't understand",
        description="Ask someone to repeat slowly.",
        setting="Conversation practice",
        lines=[
            ListeningLineSeed(speaker="A", japanese="にほんごがわかりますか。", romaji="Nihongo ga wakarimasu ka.", english="Do you understand Japanese?"),
            ListeningLineSeed(speaker="B", japanese="すこしわかります。", romaji="Sukoshi wakarimasu.", english="I understand a little."),
            ListeningLineSeed(speaker="B", japanese="もういちどおねがいします。", romaji="Mou ichido onegaishimasu.", english="One more time, please."),
            ListeningLineSeed(speaker="A", japanese="はい、ゆっくりはなします。", romaji="Hai, yukkuri hanashimasu.", english="Okay, I will speak slowly."),
        ],
    ),
]
