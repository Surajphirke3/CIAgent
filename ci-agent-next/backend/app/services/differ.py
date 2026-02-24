import difflib
from typing import Dict, List

from app.models.report import DiffItem

MIN_CHANGE_LENGTH = 50
MIN_CHANGE_RATIO = 0.95


def compute_diffs(old: Dict[str, str], new: Dict[str, str]) -> List[DiffItem]:
    diffs: List[DiffItem] = []
    for section in set(list(old.keys()) + list(new.keys())):
        old_text = old.get(section, "")
        new_text = new.get(section, "")

        if old_text == new_text:
            continue

        if not old_text and new_text:
            change_type = "added"
        elif old_text and not new_text:
            change_type = "removed"
        else:
            change_type = "modified"

        if change_type == "modified":
            if abs(len(new_text) - len(old_text)) < MIN_CHANGE_LENGTH:
                ratio = difflib.SequenceMatcher(None, old_text, new_text).ratio()
                if ratio > MIN_CHANGE_RATIO:
                    continue

        diffs.append(
            DiffItem(
                section=section,
                old_content=old_text[:2000],
                new_content=new_text[:2000],
                change_type=change_type,
            )
        )

    return diffs

