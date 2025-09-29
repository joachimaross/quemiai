export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-deep-space text-white px-4">
      <h1 className="text-5xl md:text-7xl font-bold neon-text mb-4 text-center drop-shadow-lg">Jacameno</h1>
      <h2 className="text-xl md:text-2xl font-semibold mb-8 text-accent text-center">Messaging-first Social Media, Reimagined</h2>
      <p className="max-w-xl text-center text-lg md:text-xl mb-10 text-gray-300">
        Real-time chat, vibrant communities, and authentic content. Powered by AI, built for creators, and designed for the next generation. Experience neon gradients, dark mode, and smooth transitions.
      </p>
      <div className="flex gap-4 flex-wrap justify-center mb-12">
        <a href="/community" className="px-6 py-3 rounded-full neon-bg text-black font-bold shadow-lg hover:scale-105 transition-transform">Join Community</a>
        <a href="/discover" className="px-6 py-3 rounded-full bg-secondary text-accent font-bold shadow-lg hover:bg-primary hover:text-black transition">Discover</a>
      </div>
      <footer className="mt-auto text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Jacameno. All rights reserved.
      </footer>
    </main>
  );
}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            return (
              <main className="flex flex-col items-center justify-center min-h-screen bg-deep-space text-white px-4">
                <h1 className="text-5xl md:text-7xl font-bold neon-text mb-4 text-center drop-shadow-lg">Jacameno</h1>
                <h2 className="text-xl md:text-2xl font-semibold mb-8 text-accent text-center">Messaging-first Social Media, Reimagined</h2>
                <p className="max-w-xl text-center text-lg md:text-xl mb-10 text-gray-300">
                  Real-time chat, vibrant communities, and authentic content. Powered by AI, built for creators, and designed for the next generation. Experience neon gradients, dark mode, and smooth transitions.
                </p>
                <div className="flex gap-4 flex-wrap justify-center mb-12">
                  <a href="/community" className="px-6 py-3 rounded-full neon-bg text-black font-bold shadow-lg hover:scale-105 transition-transform">Join Community</a>
                  <a href="/discover" className="px-6 py-3 rounded-full bg-secondary text-accent font-bold shadow-lg hover:bg-primary hover:text-black transition">Discover</a>
                </div>
                <footer className="mt-auto text-sm text-gray-500 text-center">
                  &copy; {new Date().getFullYear()} Jacameno. All rights reserved.
                </footer>
              </main>
            );
            alt="Window icon"
