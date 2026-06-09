from typing import TypedDict

from langgraph.graph import StateGraph, END

# Import existing tools/logic
# Import existing tools/logic
try:
    from .tools import query_medgemma, call_emergency_contact
    from .safety_guards import detect_emergency, extract_location_and_disease
    from .config import GOOGLE_MAPS_API_KEY
except ImportError:
    from tools import query_medgemma, call_emergency_contact
    from safety_guards import detect_emergency, extract_location_and_disease
    from config import GOOGLE_MAPS_API_KEY
import googlemaps

# Initialize Google Maps
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

# ==============================================================================
# 1. State Definition
# ==============================================================================

class AgentState(TypedDict):
    input: str
    output: str
    # Internal flags for routing
    is_emergency: bool
    location_query: dict  # {'location': str, 'disease': str} or None


# ==============================================================================
# 2. Tool / Helper Functions (Preserved from original)
# ==============================================================================

def execute_emergency_call(message: str) -> str:
    """Wrapper to call the Twilio emergency function."""
    call_emergency_contact()
    return "Emergency helpline has been contacted immediately. Please stay safe — help is on the way."

def execute_medgemma_chat(query: str) -> str:
    """Wrapper to call the Gemini Medical Agent."""
    try:
        return query_medgemma(query)
    except Exception:
        return (
            "I'm having technical difficulties, but I want you to know your feelings matter. "
            "Please try again shortly."
        )

def execute_maps_search(location: str, disease: str = None) -> str:
    """Performs the Google Maps search."""
    # Disease → Specialist mapping
    specialty_map = {
        "depression": "psychiatrist", "anxiety": "psychiatrist", "stress": "therapist",
        "mental": "psychologist", "suicide": "psychiatrist", "diabetes": "endocrinologist",
        "skin": "dermatologist", "rash": "dermatologist", "acne": "dermatologist",
        "heart": "cardiologist", "chest": "cardiologist", "blood": "hematologist",
        "eye": "ophthalmologist", "vision": "ophthalmologist", "stomach": "gastroenterologist",
        "cough": "general physician", "cold": "general physician", "fever": "general physician",
        "infection": "general physician", "thyroid": "endocrinologist", "bone": "orthopedic",
        "joint": "orthopedic", "teeth": "dentist", "dental": "dentist", "cancer": "oncologist",
        "allergy": "immunologist"
    }

    specialist = "doctor"
    if disease:
        for keyword, spec in specialty_map.items():
            if keyword.lower() in disease.lower():
                specialist = spec
                break

    try:
        # Geocode
        geocode_result = gmaps.geocode(location)
        if not geocode_result:
            return f"⚠️ Couldn't find coordinates for '{location}'."

        lat = geocode_result[0]["geometry"]["location"]["lat"]
        lng = geocode_result[0]["geometry"]["location"]["lng"]

        # Places Search
        query = f"{specialist} in {location}"
        places_result = gmaps.places_nearby(
            location=(lat, lng),
            radius=5000,
            keyword=query,
            type="doctor"
        )

        results = places_result.get("results", [])
        if not results:
            return f"😕 No {specialist}s found near {location}."

        # Format Output
        response_lines = [f"🩺 Top {specialist.title()}s near {location}:\n"]
        for place in results[:5]:
            name = place.get("name", "Unknown")
            address = place.get("vicinity", "Address not available")
            rating = place.get("rating", "N/A")
            response_lines.append(f"- {name} ({rating}⭐)\n  📍 {address}\n")

        return "\n".join(response_lines)

    except Exception as e:
        return f"❌ Could not fetch data: {str(e)}"


# ==============================================================================
# 3. Graph Nodes
# ==============================================================================

def node_safety_guard(state: AgentState):
    """Checks for emergency keywords."""
    user_input = state["input"]
    is_danger = detect_emergency(user_input)
    return {"is_emergency": is_danger}

def node_emergency_action(state: AgentState):
    """Executes emergency protocol."""
    result = execute_emergency_call(state["input"])
    return {"output": result}

def node_router(state: AgentState):
    """Checks if the user is asking for a location."""
    user_input = state["input"]
    loc, dis = extract_location_and_disease(user_input)
    if loc:
        return {"location_query": {"location": loc, "disease": dis}}
    return {"location_query": None}

def node_maps_action(state: AgentState):
    """Executes the maps search."""
    data = state["location_query"]
    result = execute_maps_search(data["location"], data["disease"])
    return {"output": result}

def node_chat_action(state: AgentState):
    """Executes the standard medical chat."""
    result = execute_medgemma_chat(state["input"])
    return {"output": result}


# ==============================================================================
# 4. Graph Construction
# ==============================================================================

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("safety_guard", node_safety_guard)
workflow.add_node("emergency_action", node_emergency_action)
workflow.add_node("router", node_router)
workflow.add_node("maps_action", node_maps_action)
workflow.add_node("chat_action", node_chat_action)

# Add Edges
workflow.set_entry_point("safety_guard")

def route_safety(state: AgentState):
    if state.get("is_emergency"):
        return "emergency_action"
    return "router"

workflow.add_conditional_edges(
    "safety_guard",
    route_safety,
    {
        "emergency_action": "emergency_action",
        "router": "router"
    }
)

def route_content(state: AgentState):
    if state.get("location_query"):
        return "maps_action"
    return "chat_action"

workflow.add_conditional_edges(
    "router",
    route_content,
    {
        "maps_action": "maps_action",
        "chat_action": "chat_action"
    }
)

# Terminating Edges
workflow.add_edge("emergency_action", END)
workflow.add_edge("maps_action", END)
workflow.add_edge("chat_action", END)

# Compile
graph = workflow.compile()
