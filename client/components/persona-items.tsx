import { Persona } from './persona-sidebar'; // Assuming Persona is defined in a types file
import { AnimatePresence, motion } from 'framer-motion';

import { removeChat, shareChat } from '@/app/actions';
import { PersonaItem } from './persona-item'; // Assuming PersonaItem component exists

interface PersonaItemsProps {
  personas?: Persona[];
}

export function PersonaItems({ personas }: PersonaItemsProps) {
  if (!personas?.length) return null;

  return (
    <AnimatePresence>
      {personas.map(
        (persona, index) =>
          persona && (
            <motion.div
              key={persona.id} // Assuming persona has an id property
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <PersonaItem index={index} persona={persona}>
              </PersonaItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  );
}
