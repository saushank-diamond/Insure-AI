import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { PersonaItems } from './persona-items'

interface Persona {
  id: number
  name: string
  email: string
  phone_number: number
  age: number
  occupation: string
  family_situation: string
  financial_situation: string
  existing_insurance_coverage: string
  concerns_or_priorities: string
  health_status: string
  desired_coverage: string
  budget_consciousness: string
  emotional_attitude: string
  decision_making_style: string
  level_of_financial_literacy: string
  trust_issues: string
}

interface PersonaListProps {
  personas: Persona[]
}

export function PersonaList({ personas }: PersonaListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {personas?.length ? (
          <div className="space-y-2 px-2">
            <PersonaItems personas={personas} />{' '}
            {/* Using SidebarItems for personas */}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No personas available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
