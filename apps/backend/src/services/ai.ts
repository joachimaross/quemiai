import nlp from 'compromise';
import { SpeechClient } from '@google-cloud/speech';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Recommender = require('js-recommender');

// Creates a client
const speechClient = new SpeechClient();

export const improveText = (text: string) => {
  const doc = nlp(text);

  const suggestions = [];

  // Suggest converting to past tense
  if (doc.verbs().has('#PresentTense')) {
    suggestions.push({
      type: 'Tense',
      message: 'Consider using past tense for storytelling.',
      suggestion: doc.verbs().toPastTense().out('text'),
    });
  }

  // Suggest converting to plural
  if (doc.nouns().has('#Singular')) {
    suggestions.push({
      type: 'Pluralization',
      message: 'Consider using the plural form.',
      suggestion: doc.nouns().toPlural().out('text'),
    });
  }

  // Suggest converting to singular
  if (doc.nouns().has('#Plural')) {
    suggestions.push({
      type: 'Singularization',
      message: 'Consider using the singular form.',
      suggestion: doc.nouns().toSingular().out('text'),
    });
  }

  // Suggest negating the sentence
  suggestions.push({
    type: 'Negation',
    message: 'Consider negating the sentence.',
    suggestion: doc.sentences().toNegative().out('text'),
  });

  return {
    original: text,
    suggestions,
  };
};

export const generateCaptions = async (filePath: string) => {
  const audio = {
    uri: filePath,
  };
  const config = {
    encoding: 'LINEAR16' as const,
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await speechClient.recognize(request);
  const transcription = response.results
    ?.map((result) => result.alternatives?.[0]?.transcript)
    .join('\n');

  return transcription;
};

interface Post {
  id: string;
  content: string;
  userId: string;
}

interface Recommendation {
  item: string;
  score: number;
}

export class AdvancedRecommendationEngine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recommender: any; // js-recommender lacks type definitions

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recommender = new (Recommender as any).Recommender();
  }

  train(posts: Post[], likedPosts: Post[]) {
    const ratings: { [userId: string]: { [postId: string]: number } } = {};

    for (const post of posts) {
      if (!ratings[post.userId]) {
        ratings[post.userId] = {};
      }
      const liked = likedPosts.some(
        (p) => p.id === post.id && p.userId === post.userId,
      );
      ratings[post.userId][post.id] = liked ? 1 : 0;
    }

    this.recommender.input(ratings);
    this.recommender.transform();
  }

  getRecommendations(userId: string, posts: Post[]): (Post | undefined)[] {
    const recommendations: Recommendation[] =
      this.recommender.recommend(userId);
    const recommendedPosts = recommendations.map((recommendation) => {
      return posts.find((post) => post.id === recommendation.item);
    });

    return recommendedPosts;
  }
}
