from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class KanaSeed:
    character: str
    reading: str
    group: str
    audio_text: Optional[str] = None


_BASIC_ROMAJI = [
    ("a", "あ", "ア"),
    ("i", "い", "イ"),
    ("u", "う", "ウ"),
    ("e", "え", "エ"),
    ("o", "お", "オ"),
    ("ka", "か", "カ"),
    ("ki", "き", "キ"),
    ("ku", "く", "ク"),
    ("ke", "け", "ケ"),
    ("ko", "こ", "コ"),
    ("sa", "さ", "サ"),
    ("shi", "し", "シ"),
    ("su", "す", "ス"),
    ("se", "せ", "セ"),
    ("so", "そ", "ソ"),
    ("ta", "た", "タ"),
    ("chi", "ち", "チ"),
    ("tsu", "つ", "ツ"),
    ("te", "て", "テ"),
    ("to", "と", "ト"),
    ("na", "な", "ナ"),
    ("ni", "に", "ニ"),
    ("nu", "ぬ", "ヌ"),
    ("ne", "ね", "ネ"),
    ("no", "の", "ノ"),
    ("ha", "は", "ハ"),
    ("hi", "ひ", "ヒ"),
    ("fu", "ふ", "フ"),
    ("he", "へ", "ヘ"),
    ("ho", "ほ", "ホ"),
    ("ma", "ま", "マ"),
    ("mi", "み", "ミ"),
    ("mu", "む", "ム"),
    ("me", "め", "メ"),
    ("mo", "も", "モ"),
    ("ya", "や", "ヤ"),
    ("yu", "ゆ", "ユ"),
    ("yo", "よ", "ヨ"),
    ("ra", "ら", "ラ"),
    ("ri", "り", "リ"),
    ("ru", "る", "ル"),
    ("re", "れ", "レ"),
    ("ro", "ろ", "ロ"),
    ("wa", "わ", "ワ"),
    ("o", "を", "ヲ"),
    ("n", "ん", "ン"),
]

_VOICED_ROMAJI = [
    ("ga", "が", "ガ"),
    ("gi", "ぎ", "ギ"),
    ("gu", "ぐ", "グ"),
    ("ge", "げ", "ゲ"),
    ("go", "ご", "ゴ"),
    ("za", "ざ", "ザ"),
    ("ji", "じ", "ジ"),
    ("zu", "ず", "ズ"),
    ("ze", "ぜ", "ゼ"),
    ("zo", "ぞ", "ゾ"),
    ("da", "だ", "ダ"),
    ("ji", "ぢ", "ヂ"),
    ("zu", "づ", "ヅ"),
    ("de", "で", "デ"),
    ("do", "ど", "ド"),
    ("ba", "ば", "バ"),
    ("bi", "び", "ビ"),
    ("bu", "ぶ", "ブ"),
    ("be", "べ", "ベ"),
    ("bo", "ぼ", "ボ"),
    ("pa", "ぱ", "パ"),
    ("pi", "ぴ", "ピ"),
    ("pu", "ぷ", "プ"),
    ("pe", "ぺ", "ペ"),
    ("po", "ぽ", "ポ"),
]

_YOON_ROMAJI = [
    ("kya", "きゃ", "キャ"),
    ("kyu", "きゅ", "キュ"),
    ("kyo", "きょ", "キョ"),
    ("gya", "ぎゃ", "ギャ"),
    ("gyu", "ぎゅ", "ギュ"),
    ("gyo", "ぎょ", "ギョ"),
    ("sha", "しゃ", "シャ"),
    ("shu", "しゅ", "シュ"),
    ("sho", "しょ", "ショ"),
    ("ja", "じゃ", "ジャ"),
    ("ju", "じゅ", "ジュ"),
    ("jo", "じょ", "ジョ"),
    ("cha", "ちゃ", "チャ"),
    ("chu", "ちゅ", "チュ"),
    ("cho", "ちょ", "チョ"),
    ("nya", "にゃ", "ニャ"),
    ("nyu", "にゅ", "ニュ"),
    ("nyo", "にょ", "ニョ"),
    ("hya", "ひゃ", "ヒャ"),
    ("hyu", "ひゅ", "ヒュ"),
    ("hyo", "ひょ", "ヒョ"),
    ("bya", "びゃ", "ビャ"),
    ("byu", "びゅ", "ビュ"),
    ("byo", "びょ", "ビョ"),
    ("pya", "ぴゃ", "ピャ"),
    ("pyu", "ぴゅ", "ピュ"),
    ("pyo", "ぴょ", "ピョ"),
    ("mya", "みゃ", "ミャ"),
    ("myu", "みゅ", "ミュ"),
    ("myo", "みょ", "ミョ"),
    ("rya", "りゃ", "リャ"),
    ("ryu", "りゅ", "リュ"),
    ("ryo", "りょ", "リョ"),
]


def _build_kana(script_index: int) -> list[KanaSeed]:
    items = [
        KanaSeed(character=entry[script_index], reading=entry[0], group="basic")
        for entry in _BASIC_ROMAJI
    ]
    items.extend(
        KanaSeed(character=entry[script_index], reading=entry[0], group="voiced")
        for entry in _VOICED_ROMAJI
    )
    items.extend(
        KanaSeed(character=entry[script_index], reading=entry[0], group="yoon")
        for entry in _YOON_ROMAJI
    )
    return items


HIRAGANA = _build_kana(1) + [
    KanaSeed(character="っ", reading="small tsu", group="sokuon", audio_text="きって")
]
KATAKANA = _build_kana(2) + [
    KanaSeed(character="ッ", reading="small tsu", group="sokuon", audio_text="キッテ"),
    KanaSeed(character="ー", reading="long vowel", group="long-vowel", audio_text="コーヒー"),
]

# Backwards-compatible exports used by the pronunciation endpoints.
HIRAGANA_PRONUNCIATIONS = [(item.character, item.reading) for item in HIRAGANA]
KATAKANA_PRONUNCIATIONS = [(item.character, item.reading) for item in KATAKANA]
HIRAGANA_CHARACTERS = [item.character for item in HIRAGANA]
KATAKANA_CHARACTERS = [item.character for item in KATAKANA]
