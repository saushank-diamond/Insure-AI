'use client'
import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'
import { ClearHistory } from '@/components/clear-history'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { useState, useRef, useEffect } from 'react'
import { PersonaList } from './persona-list'
import { buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'
import { IconPlus } from './ui/icons'

export interface Persona {
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

interface PersonaSidebarProps {
  userId?: string
}

const PersonaSidebar: React.FC<PersonaSidebarProps> = ({ userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userData, setUserData] = useState<Persona[]>([])

  // const loadPersonas = cache(async (file: File) => {
  //   try {
  //     const response = await fetch('http://localhost:8000/v1/personas')
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch user data')
  //     }
  //     const personasData = await response.json()
  //     if (personasData.length === 0) {
  //       return []
  //     }
  //     return personasData
  //   } catch (error) {
  //     console.error('Error fetching user data:', error)
  //     return []
  //   }
  // })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/personas`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      let userData = Object.values(await response.json())
      console.log(userData)
      if (userData.length === 0) {
        return
      }

      setUserData(userData[0] as Persona[])
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)

    if (file) {
      // Create a new FormData instance
      const formData = new FormData()
      formData.append('file', file)

      // Make a POST request to the server
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/personas/create`, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (response.ok) {
            console.log('File uploaded successfully')
          } else {
            console.error('Failed to upload file')
          }
        })
        .catch(error => {
          console.error('Error uploading file:', error)
        })
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Define a dummy function that returns a ServerActionResult<void>
  const clearChats = () => {
    return Promise.resolve() // Example: Resolve with an empty promise
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px] left-0">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {userData?.length ? (
            <div className="space-y-2 px-2">
              <PersonaList personas={userData} />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No personas uploaded
              </p>
            </div>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileInputChange}
      />
      <button
        onClick={handleUploadButtonClick}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
        )}
      >
        <IconPlus className="-translate-x-2 stroke-2" />
        Upload CSV
      </button>
    </Sidebar>
  )
}

export default PersonaSidebar
