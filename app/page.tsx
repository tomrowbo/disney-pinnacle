import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/26/92/e4/97/disneyland-paris.jpg?w=900&h=500&s=1')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-disney-dark/90 to-disney-darker/90"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 disney-title-hero animate-pulse">
                Disney Pinnacle
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Collect, trade, and showcase your favorite Disney digital pins in the ultimate Disney fan experience
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="disney-button text-center">
                  Start Collecting Now
                </Link>
                <Link href="/marketplace" className="bg-gray-800 text-white border-2 border-disney-light-blue font-bold py-3 px-6 rounded-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-gray-700 text-center">
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-24 text-disney-darker" preserveAspectRatio="none" viewBox="0 0 1440 54">
              <path fill="currentColor" d="M0,22L48,19.7C96,17,192,13,288,15.2C384,17,480,26,576,26.2C672,26,768,17,864,15.2C960,13,1056,17,1152,19.7C1248,22,1344,22,1392,22L1440,22L1440,54L1392,54C1344,54,1248,54,1152,54C1056,54,960,54,864,54C768,54,672,54,576,54C480,54,384,54,288,54C192,54,96,54,48,54L0,54Z"></path>
            </svg>
          </div>
        </section>
        
        <section className="py-12 bg-disney-darker">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Classic Characters", count: 156, image: "🏰" },
                { title: "Pixar Heroes", count: 89, image: "🚀" },
                { title: "Princess Collection", count: 124, image: "👑" }
              ].map((collection, index) => (
                <div key={index} className="disney-card group cursor-pointer text-white">
                  <div className="text-6xl mb-4 text-center group-hover:animate-bounce">{collection.image}</div>
                  <h3 className="text-2xl font-bold mb-2 text-center">{collection.title}</h3>
                  <p className="text-gray-400 text-center">{collection.count} Pins Available</p>
                  <div className="mt-4 text-center">
                    <span className="text-disney-light-blue hover:text-disney-purple transition-colors">
                      View Collection →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-r from-disney-blue to-disney-purple text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-8">Join the Magic Today!</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Start your journey into the world of Disney digital collectibles. Trade with fans worldwide and build your dream collection.
            </p>
            <Link href="/signup" className="bg-white text-disney-darker font-bold py-4 px-8 rounded-full transform transition-all duration-200 hover:scale-105 hover:shadow-xl inline-block">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}