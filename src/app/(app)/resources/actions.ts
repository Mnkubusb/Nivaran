'use server';

import { searchYoutube } from '@/lib/youtube';

export async function searchResources(query: string) {
  if (!query) {
    return [];
  }
  try {
    const results = await searchYoutube(query);
    return results;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    // In a real app, you'd want to handle this more gracefully
    return [];
  }
}
