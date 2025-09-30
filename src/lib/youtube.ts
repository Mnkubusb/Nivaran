import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export async function searchYoutube(query: string) {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 12,
      videoCategoryId: '24', // Entertainment, good for general purpose
      topicId: '/m/0glt670', // Health topic
    });

    const items = response.data.items;
    if (!items) {
      return [];
    }

    return items.map(item => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || 'No title',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || 'https://placehold.co/600x400',
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw new Error('Failed to fetch videos from YouTube.');
  }
}
