import math
import time
from fastapi import APIRouter

router = APIRouter(prefix="/api/prompts", tags=["prompts"])

PROMPTS = [
    "Write about a silence that changed your life.",
    "What did you almost say, but chose not to?",
    "Describe a place that feels like forgiveness.",
    "Write a letter to your younger self in 7 lines.",
    "Turn a memory into weather.",
    "Write from the point of view of a closed door.",
    "What does healing smell like?",
    "Describe the night you became different.",
    "Write a poem using only ordinary objects.",
    'Tell a story where no one says "I love you" but it is obvious.',
]


@router.get("/daily")
async def daily_prompt():
    day = math.floor(time.time() / (60 * 60 * 24))
    prompt = PROMPTS[day % len(PROMPTS)]
    return {"prompt": prompt, "key": day}
