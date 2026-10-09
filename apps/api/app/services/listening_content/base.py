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
    category: str = "Everyday"
    setting: str
    lines: list[ListeningLineSeed]


def scenario(
    id: str,
    title: str,
    description: str,
    *,
    setting: str,
    category: str,
    level: str,
    lines: list[tuple[str, str, str, str]],
) -> ListeningScenarioSeed:
    return ListeningScenarioSeed(
        id=id,
        title=title,
        description=description,
        setting=setting,
        category=category,
        level=level,
        lines=[
            ListeningLineSeed(speaker=speaker, japanese=japanese, romaji=romaji, english=english)
            for speaker, japanese, romaji, english in lines
        ],
    )
