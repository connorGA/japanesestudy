import { KanjiGrid } from "@/components/CharacterStudy";
import { PageHeader } from "@/components/PageHeader";

const starterKanji = [
  {
    character: "日",
    meaning: "sun, day",
    onyomi: "ニチ, ジツ",
    kunyomi: "ひ, か",
    example: "日本 (にほん) - Japan",
  },
  {
    character: "月",
    meaning: "moon, month",
    onyomi: "ゲツ, ガツ",
    kunyomi: "つき",
    example: "月曜日 (げつようび) - Monday",
  },
  {
    character: "人",
    meaning: "person",
    onyomi: "ジン, ニン",
    kunyomi: "ひと",
    example: "日本人 (にほんじん) - Japanese person",
  },
  {
    character: "山",
    meaning: "mountain",
    onyomi: "サン",
    kunyomi: "やま",
    example: "富士山 (ふじさん) - Mt. Fuji",
  },
  {
    character: "川",
    meaning: "river",
    onyomi: "セン",
    kunyomi: "かわ",
    example: "川口 (かわぐち) - river mouth",
  },
  {
    character: "水",
    meaning: "water",
    onyomi: "スイ",
    kunyomi: "みず",
    example: "水曜日 (すいようび) - Wednesday",
  },
  {
    character: "火",
    meaning: "fire",
    onyomi: "カ",
    kunyomi: "ひ",
    example: "火曜日 (かようび) - Tuesday",
  },
  {
    character: "木",
    meaning: "tree, wood",
    onyomi: "モク, ボク",
    kunyomi: "き",
    example: "木曜日 (もくようび) - Thursday",
  },
  {
    character: "金",
    meaning: "gold, money",
    onyomi: "キン, コン",
    kunyomi: "かね",
    example: "金曜日 (きんようび) - Friday",
  },
  {
    character: "土",
    meaning: "earth, soil",
    onyomi: "ド, ト",
    kunyomi: "つち",
    example: "土曜日 (どようび) - Saturday",
  },
  {
    character: "大",
    meaning: "big",
    onyomi: "ダイ, タイ",
    kunyomi: "おお",
    example: "大学 (だいがく) - university",
  },
  {
    character: "小",
    meaning: "small",
    onyomi: "ショウ",
    kunyomi: "ちい, こ, お",
    example: "小さい (ちいさい) - small",
  },
];

export default function KanjiPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Start with high-frequency characters, then connect each one to readings and useful vocabulary."
        eyebrow="Kanji"
        title="Build meaning from characters."
      />
      <KanjiGrid items={starterKanji} />
    </main>
  );
}
