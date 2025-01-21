import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import * as React from 'react'
import { Persona } from './persona-sidebar'
import { SelfHostedConversationConfig, useConversation } from 'vocode'

interface PersonaItemProps {
  index: number
  persona: Persona
}

export function PersonaItem({ index, persona }: PersonaItemProps) {
  return (
    <motion.div
      className="relative h-8"
      variants={{
        initial: {
          height: 0,
          opacity: 0
        },
        animate: {
          height: 'auto',
          opacity: 1
        }
      }}
      initial="initial"
      animate="animate"
      transition={{
        duration: 0.25,
        ease: 'easeIn',
        delay: index * 0.05,
        staggerChildren: 0.05
      }}
    >
      <div
        className="cursor-pointer mt-8 relative max-h-11 flex-1 overflow-hidden text-ellipsis break-all"
        title={persona.name}
      >
        <div className="w-full max-w-3xl space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="grid gap-0.5">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold tracking-tighter">
                  {persona.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {persona.occupation}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {persona.email} • {persona.age}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-2"></div>
    </motion.div>
  )
}
