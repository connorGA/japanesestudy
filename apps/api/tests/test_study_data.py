from app.services.flashcards import BASIC_FLASHCARDS
from app.services.kana import HIRAGANA, KATAKANA
from app.services.kanji import COMMON_KANJI


def test_complete_kana_decks_have_unique_entries() -> None:
    assert len(HIRAGANA) == 105
    assert len(KATAKANA) == 106
    assert len({item.character for item in HIRAGANA}) == len(HIRAGANA)
    assert len({item.character for item in KATAKANA}) == len(KATAKANA)
    assert {"basic", "voiced", "yoon", "sokuon"} <= {item.group for item in HIRAGANA}
    assert {"basic", "voiced", "yoon", "sokuon", "long-vowel"} <= {
        item.group for item in KATAKANA
    }


def test_common_kanji_deck_is_frequency_ordered_and_unique() -> None:
    assert len(COMMON_KANJI) == 100
    assert [item.character for item in COMMON_KANJI[:5]] == ["日", "一", "国", "会", "人"]
    assert len({item.character for item in COMMON_KANJI}) == 100
    assert len({item.id for item in COMMON_KANJI}) == 100
    assert all(item.example and item.example_reading for item in COMMON_KANJI)


def test_vocabulary_flashcard_ids_are_unique() -> None:
    assert len({item.id for item in BASIC_FLASHCARDS}) == len(BASIC_FLASHCARDS)
