from pydantic import BaseModel


class Persona(BaseModel):
    id: int
    name: str
    email: str
    phone_number: int
    age: int
    occupation: str
    family_situation: str
    financial_situation: str
    existing_insurance_coverage: str
    concerns_or_priorities: str
    health_status: str
    desired_coverage: str
    budget_consciousness: str
    emotional_attitude: str
    decision_making_style: str
    level_of_financial_literacy: str
    trust_issues: str
