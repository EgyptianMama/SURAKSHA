'use server';
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import '@/ai/flows/disaster-simulation.ts';
import '@/ai/flows/send-email-alert.ts';
import '@/ai/flows/safe-spot-quiz.ts';
import '@/ai/flows/safety-chatbot.ts';
