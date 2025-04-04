// src/services/importValidator.js
import { z } from 'zod';

const journeySchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(["Critical", "Important", "Next", "Sometime Maybe"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  scheduledStartDate: z.string().optional(),
  subJourneys: z.array(z.object({
    id: z.string(),
    title: z.string(),
    priority: z.enum(["Critical", "Important", "Next", "Sometime Maybe"]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
  })).optional(),
});

export const validateJourneyImport = (data) => journeySchema.safeParse(data);
