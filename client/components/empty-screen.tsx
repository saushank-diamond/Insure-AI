import { UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { Persona } from './persona-sidebar'

const exampleMessages = [
  {
    heading: 'Assess current coverage',
    message: 'Can you tell me about your current insurance coverage?'
  },
  {
    heading: 'Financial goals and priorities',
    message: 'What are your financial goals and priorities?'
  },
  {
    heading: 'Desired coverage',
    message: 'What kind of coverage are you looking for?'
  }
]

interface EmptyScreenProps {
  chatProps: Pick<UseChatHelpers, 'setInput'>
  personaDetails?: Persona
}

export function EmptyScreen({ chatProps, personaDetails }: EmptyScreenProps) {
  return (
    <div className="max-w-2xl px-4 mr-6">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to InsuranceGPT! 🤖
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Our AI bot will roleplay as a customer, embodying a persona to engage
          in authentic conversations and simulate realistic interactions to aid
          in your training and understanding of client needs.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the voice chat.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => chatProps.setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
