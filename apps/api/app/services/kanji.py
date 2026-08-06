from dataclasses import dataclass


@dataclass(frozen=True)
class KanjiSeed:
    id: str
    character: str
    meaning: str
    onyomi: str
    kunyomi: str
    example: str
    example_reading: str
    example_romaji: str
    example_english: str


# Frequency order follows the commonly published newspaper frequency list/JLPT Sensei.
COMMON_KANJI = [
    KanjiSeed(
        "sun-day", "日", "day; sun", "ニチ、ジツ", "ひ、-び、-か",
        "日本", "にほん", "Nihon", "Japan",
    ),
    KanjiSeed(
        "one", "一", "one", "イチ、イツ", "ひと、ひと-つ",
        "一つ", "ひとつ", "hitotsu", "one thing",
    ),
    KanjiSeed(
        "country", "国", "country", "コク", "くに",
        "外国", "がいこく", "gaikoku", "foreign country",
    ),
    KanjiSeed(
        "meet", "会", "meet; association", "カイ、エ", "あ-う",
        "会社", "かいしゃ", "kaisha", "company",
    ),
    KanjiSeed(
        "person", "人", "person", "ジン、ニン", "ひと",
        "日本人", "にほんじん", "nihonjin", "Japanese person",
    ),
    KanjiSeed(
        "year", "年", "year", "ネン", "とし",
        "今年", "ことし", "kotoshi", "this year",
    ),
    KanjiSeed(
        "large", "大", "large; great", "ダイ、タイ", "おお-きい、おお-いに",
        "大学", "だいがく", "daigaku", "university",
    ),
    KanjiSeed(
        "ten", "十", "ten", "ジュウ、ジッ", "とお、と",
        "十分", "じゅっぷん", "juppun", "ten minutes",
    ),
    KanjiSeed(
        "two", "二", "two", "ニ", "ふた、ふた-つ",
        "二人", "ふたり", "futari", "two people",
    ),
    KanjiSeed(
        "book-origin", "本", "book; origin", "ホン", "もと",
        "本屋", "ほんや", "hon'ya", "bookstore",
    ),
    KanjiSeed(
        "middle", "中", "middle; inside", "チュウ", "なか、うち、あた-る",
        "中学校", "ちゅうがっこう", "chūgakkō", "junior high school",
    ),
    KanjiSeed(
        "long", "長", "long; leader", "チョウ", "なが-い",
        "社長", "しゃちょう", "shachō", "company president",
    ),
    KanjiSeed(
        "exit", "出", "exit; produce", "シュツ、スイ", "で-る、だ-す",
        "出口", "でぐち", "deguchi", "exit",
    ),
    KanjiSeed(
        "three", "三", "three", "サン", "み、み-つ、みっ-つ",
        "三つ", "みっつ", "mittsu", "three things",
    ),
    KanjiSeed(
        "same", "同", "same", "ドウ", "おな-じ",
        "同じ", "おなじ", "onaji", "same",
    ),
    KanjiSeed(
        "time", "時", "time; hour", "ジ", "とき",
        "時間", "じかん", "jikan", "time",
    ),
    KanjiSeed(
        "government", "政", "government; politics", "セイ、ショウ", "まつりごと",
        "政治", "せいじ", "seiji", "politics",
    ),
    KanjiSeed(
        "matter", "事", "matter; thing", "ジ、ズ", "こと、つか-える",
        "仕事", "しごと", "shigoto", "work; job",
    ),
    KanjiSeed(
        "self", "自", "self", "ジ、シ", "みずか-ら、おの-ずから",
        "自分", "じぶん", "jibun", "oneself",
    ),
    KanjiSeed(
        "go", "行", "go; conduct", "コウ、ギョウ、アン", "い-く、ゆ-く、おこな-う",
        "銀行", "ぎんこう", "ginkō", "bank",
    ),
    KanjiSeed(
        "company-shrine", "社", "company; shrine", "シャ", "やしろ",
        "会社", "かいしゃ", "kaisha", "company",
    ),
    KanjiSeed(
        "see", "見", "see; opinion", "ケン", "み-る、み-える、み-せる",
        "意見", "いけん", "iken", "opinion",
    ),
    KanjiSeed(
        "moon-month", "月", "moon; month", "ゲツ、ガツ", "つき",
        "月曜日", "げつようび", "getsuyōbi", "Monday",
    ),
    KanjiSeed(
        "divide", "分", "part; understand", "ブン、フン、ブ",
        "わ-ける、わ-かる、わ-かれる", "分かる", "わかる", "wakaru", "to understand",
    ),
    KanjiSeed(
        "discussion", "議", "deliberation; discussion", "ギ", "なし",
        "会議", "かいぎ", "kaigi", "meeting",
    ),
    KanjiSeed(
        "after", "後", "after; behind", "ゴ、コウ", "のち、うし-ろ、あと、おく-れる",
        "午後", "ごご", "gogo", "afternoon",
    ),
    KanjiSeed(
        "before", "前", "before; front", "ゼン", "まえ",
        "名前", "なまえ", "namae", "name",
    ),
    KanjiSeed(
        "people", "民", "people; nation", "ミン", "たみ",
        "国民", "こくみん", "kokumin", "citizenry",
    ),
    KanjiSeed(
        "life", "生", "life; birth", "セイ、ショウ",
        "い-きる、う-まれる、う-む、なま", "先生", "せんせい", "sensei", "teacher",
    ),
    KanjiSeed(
        "connect", "連", "connect; accompany", "レン",
        "つら-なる、つら-ねる、つ-れる", "連絡", "れんらく", "renraku", "contact",
    ),
    KanjiSeed(
        "five", "五", "five", "ゴ", "いつ、いつ-つ",
        "五つ", "いつつ", "itsutsu", "five things",
    ),
    KanjiSeed(
        "departure", "発", "departure; emit", "ハツ、ホツ", "た-つ、あば-く、はな-つ",
        "出発", "しゅっぱつ", "shuppatsu", "departure",
    ),
    KanjiSeed(
        "interval", "間", "interval; space", "カン、ケン", "あいだ、ま",
        "時間", "じかん", "jikan", "time",
    ),
    KanjiSeed(
        "opposite", "対", "opposite; versus", "タイ、ツイ", "なし",
        "反対", "はんたい", "hantai", "opposition; against",
    ),
    KanjiSeed(
        "above", "上", "above; raise", "ジョウ、ショウ",
        "うえ、うわ、かみ、あ-げる、あ-がる、のぼ-る",
        "上手", "じょうず", "jōzu", "skillful",
    ),
    KanjiSeed(
        "section", "部", "section; department", "ブ", "なし",
        "部屋", "へや", "heya", "room",
    ),
    KanjiSeed(
        "east", "東", "east", "トウ", "ひがし",
        "東京", "とうきょう", "Tōkyō", "Tokyo",
    ),
    KanjiSeed(
        "person-suffix", "者", "person; someone", "シャ", "もの",
        "医者", "いしゃ", "isha", "doctor",
    ),
    KanjiSeed(
        "party", "党", "party; faction", "トウ", "なし",
        "政党", "せいとう", "seitō", "political party",
    ),
    KanjiSeed(
        "ground", "地", "ground; place", "チ、ジ", "つち",
        "地図", "ちず", "chizu", "map",
    ),
    KanjiSeed(
        "fit", "合", "fit; combine", "ゴウ、ガッ、カッ", "あ-う、あ-わせる",
        "場合", "ばあい", "baai", "case; situation",
    ),
    KanjiSeed(
        "city", "市", "city; market", "シ", "いち",
        "市役所", "しやくしょ", "shiyakusho", "city hall",
    ),
    KanjiSeed(
        "business", "業", "business; work", "ギョウ、ゴウ", "わざ",
        "授業", "じゅぎょう", "jugyō", "class; lesson",
    ),
    KanjiSeed(
        "inside", "内", "inside; within", "ナイ、ダイ", "うち",
        "案内", "あんない", "annai", "guidance; information",
    ),
    KanjiSeed(
        "mutual", "相", "mutual; aspect", "ソウ、ショウ", "あい",
        "相談", "そうだん", "sōdan", "consultation",
    ),
    KanjiSeed(
        "direction", "方", "direction; person", "ホウ", "かた",
        "夕方", "ゆうがた", "yūgata", "evening",
    ),
    KanjiSeed(
        "four", "四", "four", "シ", "よ、よ-つ、よっ-つ、よん",
        "四月", "しがつ", "shigatsu", "April",
    ),
    KanjiSeed(
        "determine", "定", "determine; fixed", "テイ、ジョウ",
        "さだ-める、さだ-まる、さだ-か", "予定", "よてい", "yotei", "plan; schedule",
    ),
    KanjiSeed(
        "now", "今", "now", "コン、キン", "いま",
        "今日", "きょう", "kyō", "today",
    ),
    KanjiSeed(
        "times", "回", "times; revolve", "カイ、エ", "まわ-る、まわ-す",
        "今回", "こんかい", "konkai", "this time",
    ),
    KanjiSeed(
        "new", "新", "new", "シン", "あたら-しい、あら-た、にい",
        "新聞", "しんぶん", "shinbun", "newspaper",
    ),
    KanjiSeed(
        "place", "場", "place", "ジョウ", "ば",
        "場所", "ばしょ", "basho", "place; location",
    ),
    KanjiSeed(
        "gold-money", "金", "gold; money", "キン、コン", "かね、かな",
        "お金", "おかね", "okane", "money",
    ),
    KanjiSeed(
        "member", "員", "member; employee", "イン", "なし",
        "店員", "てんいん", "ten'in", "store clerk",
    ),
    KanjiSeed(
        "nine", "九", "nine", "キュウ、ク", "ここの、ここの-つ",
        "九つ", "ここのつ", "kokonotsu", "nine things",
    ),
    KanjiSeed(
        "enter", "入", "enter; insert", "ニュウ", "い-る、はい-る、い-れる",
        "入口", "いりぐち", "iriguchi", "entrance",
    ),
    KanjiSeed(
        "choose", "選", "choose; select", "セン", "えら-ぶ",
        "選手", "せんしゅ", "senshu", "athlete; player",
    ),
    KanjiSeed(
        "stand", "立", "stand; establish", "リツ、リュウ", "た-つ、た-てる",
        "国立", "こくりつ", "kokuritsu", "national; state-run",
    ),
    KanjiSeed(
        "open", "開", "open", "カイ", "ひら-く、あ-く、あ-ける",
        "開店", "かいてん", "kaiten", "store opening",
    ),
    KanjiSeed(
        "hand", "手", "hand", "シュ", "て、た",
        "手紙", "てがみ", "tegami", "letter",
    ),
    KanjiSeed(
        "rice", "米", "rice; America", "ベイ、マイ", "こめ",
        "お米", "おこめ", "okome", "rice",
    ),
    KanjiSeed(
        "power", "力", "power; strength", "リョク、リキ", "ちから",
        "力持ち", "ちからもち", "chikaramochi", "strong person",
    ),
    KanjiSeed(
        "study", "学", "study; learning", "ガク", "まな-ぶ",
        "学校", "がっこう", "gakkō", "school",
    ),
    KanjiSeed(
        "question", "問", "question; problem", "モン", "と-う、と-い",
        "問題", "もんだい", "mondai", "problem; question",
    ),
    KanjiSeed(
        "high", "高", "high; expensive", "コウ", "たか-い、たか-まる、たか-める",
        "高校", "こうこう", "kōkō", "high school",
    ),
    KanjiSeed(
        "substitute", "代", "substitute; generation", "ダイ、タイ",
        "か-わる、か-える、よ、しろ", "時代", "じだい", "jidai", "era",
    ),
    KanjiSeed(
        "bright", "明", "bright; clear", "メイ、ミョウ",
        "あ-かり、あか-るい、あ-ける、あき-らか",
        "明日", "あした", "ashita", "tomorrow",
    ),
    KanjiSeed(
        "truth", "実", "truth; fruit", "ジツ", "み、みの-る",
        "実際", "じっさい", "jissai", "actually; in reality",
    ),
    KanjiSeed(
        "yen-circle", "円", "yen; circle", "エン", "まる-い",
        "百円", "ひゃくえん", "hyakuen", "one hundred yen",
    ),
    KanjiSeed(
        "relation", "関", "relation; barrier", "カン", "せき、かか-わる",
        "関係", "かんけい", "kankei", "relationship",
    ),
    KanjiSeed(
        "decide", "決", "decide", "ケツ", "き-める、き-まる",
        "決定", "けってい", "kettei", "decision",
    ),
    KanjiSeed(
        "child", "子", "child", "シ、ス", "こ",
        "子供", "こども", "kodomo", "child",
    ),
    KanjiSeed(
        "move", "動", "move", "ドウ", "うご-く、うご-かす",
        "動物", "どうぶつ", "dōbutsu", "animal",
    ),
    KanjiSeed(
        "capital", "京", "capital", "キョウ、ケイ", "みやこ",
        "東京", "とうきょう", "Tōkyō", "Tokyo",
    ),
    KanjiSeed(
        "whole", "全", "whole; all", "ゼン", "すべ-て、まった-く",
        "全部", "ぜんぶ", "zenbu", "all; everything",
    ),
    KanjiSeed(
        "eye", "目", "eye; item", "モク、ボク", "め、ま",
        "目的", "もくてき", "mokuteki", "purpose",
    ),
    KanjiSeed(
        "surface", "表", "surface; express", "ヒョウ",
        "おもて、あらわ-す、あらわ-れる", "発表", "はっぴょう", "happyō", "presentation",
    ),
    KanjiSeed(
        "war", "戦", "war; fight", "セン", "いくさ、たたか-う",
        "戦争", "せんそう", "sensō", "war",
    ),
    KanjiSeed(
        "pass-through", "経", "pass through; manage", "ケイ、キョウ", "へ-る、た-つ",
        "経験", "けいけん", "keiken", "experience",
    ),
    KanjiSeed(
        "commute", "通", "pass through; commute", "ツウ、ツ",
        "とお-る、とお-す、かよ-う", "通学", "つうがく", "tsūgaku", "commuting to school",
    ),
    KanjiSeed(
        "outside", "外", "outside", "ガイ、ゲ", "そと、ほか、はず-す、はず-れる",
        "外国", "がいこく", "gaikoku", "foreign country",
    ),
    KanjiSeed(
        "most", "最", "most; extreme", "サイ", "もっと-も",
        "最近", "さいきん", "saikin", "recently",
    ),
    KanjiSeed(
        "say", "言", "say; word", "ゲン、ゴン", "い-う、こと",
        "言葉", "ことば", "kotoba", "word; language",
    ),
    KanjiSeed(
        "clan", "氏", "family name; clan", "シ", "うじ",
        "氏名", "しめい", "shimei", "full name",
    ),
    KanjiSeed(
        "present", "現", "present; appear", "ゲン", "あらわ-れる、あらわ-す、うつつ",
        "現在", "げんざい", "genzai", "the present; currently",
    ),
    KanjiSeed(
        "reason", "理", "reason; logic", "リ", "ことわり",
        "料理", "りょうり", "ryōri", "cooking; cuisine",
    ),
    KanjiSeed(
        "investigate", "調", "investigate; tune", "チョウ",
        "しら-べる、ととの-う、ととの-える", "調子", "ちょうし", "chōshi", "condition",
    ),
    KanjiSeed(
        "body", "体", "body", "タイ、テイ", "からだ",
        "体温", "たいおん", "taion", "body temperature",
    ),
    KanjiSeed(
        "change", "化", "change; transform", "カ、ケ", "ば-ける、ば-かす",
        "文化", "ぶんか", "bunka", "culture",
    ),
    KanjiSeed(
        "rice-field", "田", "rice field", "デン", "た",
        "田んぼ", "たんぼ", "tanbo", "rice field",
    ),
    KanjiSeed(
        "hit", "当", "hit; correct", "トウ", "あ-たる、あ-てる",
        "本当", "ほんとう", "hontō", "truth; really",
    ),
    KanjiSeed(
        "eight", "八", "eight", "ハチ", "や、や-つ、やっ-つ、よう",
        "八つ", "やっつ", "yattsu", "eight things",
    ),
    KanjiSeed(
        "six", "六", "six", "ロク", "む、む-つ、むっ-つ、むい",
        "六つ", "むっつ", "muttsu", "six things",
    ),
    KanjiSeed(
        "approximately", "約", "approximately; promise", "ヤク", "なし",
        "約束", "やくそく", "yakusoku", "promise",
    ),
    KanjiSeed(
        "main", "主", "main; master", "シュ、ス", "ぬし、おも",
        "主人", "しゅじん", "shujin", "husband; master",
    ),
    KanjiSeed(
        "topic", "題", "topic; title", "ダイ", "なし",
        "宿題", "しゅくだい", "shukudai", "homework",
    ),
    KanjiSeed(
        "below", "下", "below; descend", "カ、ゲ",
        "した、しも、もと、さ-げる、くだ-る、お-りる",
        "地下", "ちか", "chika", "basement; underground",
    ),
    KanjiSeed(
        "neck", "首", "neck; head", "シュ", "くび",
        "首相", "しゅしょう", "shushō", "prime minister",
    ),
    KanjiSeed(
        "intention", "意", "intention; meaning", "イ", "なし",
        "意味", "いみ", "imi", "meaning",
    ),
    KanjiSeed(
        "law", "法", "law; method", "ホウ、ハッ、ホッ", "のり",
        "方法", "ほうほう", "hōhō", "method; way",
    ),
]


__all__ = ["KanjiSeed", "COMMON_KANJI"]
