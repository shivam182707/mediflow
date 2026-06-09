
import re

# -----------------------------------------------------------
# 1. Emergency Detection Regex
# -----------------------------------------------------------
EMERGENCY_PATTERN = re.compile(
    r"""
    \b(
        # 🔥 Explicit suicidal intent
        suicide|suicidal|kill\s*myself|end\s*my\s*life|want\s*to\s*die|
        taking\s*my\s*life|ending\s*it\s*all|ready\s*to\s*die|
        die\s*by\s*suicide|hang\s*myself|jump\s*off|overdose|
        poison\s*myself|shoot\s*myself|bleed\s*out|

        # 🔥 Strong indirect signals of self-harm
        self[- ]?harm|hurt\s*myself|cut\s*myself|
        thinking\s*about\s*ending\s*it|
        i'?m\s*scared\s*of\s*what\s*i'?ll\s*do|
        i\s*might\s*do\s*something\s*stupid|
        i\s*don'?t\s*trust\s*myself|

        # 🔥 Hopelessness (clinical danger zone)
        no\s*reason\s*to\s*live|life\s*isn'?t\s*worth\s*living|
        nothing\s*matters\s*anymore|i\s*wish\s*it\s*would\s*all\s*end|
        why\s*am\s*i\s*alive|life\s*has\s*no\s*purpose|
        everything\s*is\s*pointless|i'?m\s*done\s*with\s*this\s*life|
        i\s*want\s*out\s*of\s*this\s*life|no\s*hope\s*left|

        # 🔥 Severe emotional collapse
        i'?m\s*breaking\s*down|i'?m\s*falling\s*apart|
        i'?m\s*at\s*my\s*limit|i\s*can'?t\s*handle\s*this\s*anymore|
        i\s*can'?t\s*go\s*on|i'?m\s*done\s*fighting|
        i'?m\s*exhausted\s*with\s*life|

        # 🔥 “Giving up” statements
        i'?m\s*giving\s*up|i\s*give\s*up\s*on\s*everything|
        what'?s\s*the\s*point\s*anymore|why\s*should\s*i\s*try|
        i'?ve\s*lost\s*all\s*will\s*to\s*live|

        # 🔥 Extreme sadness with danger indicators
        i'?m\s*in\s*so\s*much\s*pain|i'?m\s*drowning|
        i\s*feel\s*empty\s*inside|i\s*feel\s*numb|
        i'?m\s*completely\s*alone|i'?m\s*beyond\s*tired|
        i'?m\s*so\s*tired\s*of\s*everything|

        # 🔥 Self-hate at dangerous intensity
        i\s*hate\s*myself\s*so\s*much|i'?m\s*better\s*off\s*gone|
        nobody\s*would\s*miss\s*me|nobody\s*cares\s*if\s*i\s*die|
        i'?m\s*worthless|i'?m\s*a\s*burden|

        # 🔥 “Disappearing” or “not existing”
        i\s*don'?t\s*want\s*to\s*exist|
        wish\s*i\s*could\s*disappear|
        i'?d\s*be\s*happier\s*gone|
        i\s*should\s*vanish
    )\b
    """,
    re.IGNORECASE | re.VERBOSE,
)

# -----------------------------------------------------------
# 2. Location & Disease Detection Regex
# -----------------------------------------------------------
LOCATION_PATTERN = re.compile(
    r"""
    (?:
        (?:find\s*(?:me\s*)?(?:a|some)?\s*)?
        (?:good|best|top)?\s*
        (?:nearby\s*)?
        (?:doctors?|therapists?|psychiatrists?|clinics?|hospitals?)
        (?:\s*(?:in|near|around|at|within|close\s*to)\s+)?
        ([A-Za-z\s]+)
    )
    |
    (?:
        (?:any\s*)?(?:doctors?|therapists?|psychiatrists?|hospitals?|clinics?)
        \s*(?:available\s*)?(?:nearby|around|close\s*to|in|at)\s+([A-Za-z\s]+)
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)

DISEASE_PATTERN = re.compile(
    r"""
    (?:
        (?:top|best|good)?\s*
        ([A-Za-z\s]+?)\s*
        (?:doctors?|therapists?|psychiatrists?|specialists?|clinics?)\s+
        (?:in|near|around|at|within|close\s*to)
    )
    |
    (?:
        (?:doctor|specialist|therapist)\s*(?:for|treating|who\s*treats)\s*
        ([A-Za-z\s]+)
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)


def detect_emergency(text: str) -> bool:
    """Returns True if the text contains suicidal or self-harm keywords."""
    return bool(EMERGENCY_PATTERN.search(text))


def extract_location_and_disease(text: str) -> tuple[str | None, str | None]:
    """
    Attempts to extract a location and a disease/condition from the query.
    Returns (location, disease) or (None, None).
    """
    location_match = LOCATION_PATTERN.search(text)
    disease_match = DISEASE_PATTERN.search(text)

    if location_match:
        # Group 1 is first alternative, Group 2 is second alternative
        location = location_match.group(1) or location_match.group(2)
        location = location.strip() if location else None
        
        disease = None
        if disease_match:
             disease = disease_match.group(1) or disease_match.group(2)
             disease = disease.strip() if disease else None
             
        return location, disease
    
    return None, None
