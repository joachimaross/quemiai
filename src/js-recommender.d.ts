declare module 'js-recommender' {
  export class Recommender {
    constructor();
    input(data: { [userId: string]: { [itemId: string]: number } }): void;
    transform(): void;
    recommend(userId: string): Array<{ item: string; score: number }>;
  }

  export default Recommender;
}
