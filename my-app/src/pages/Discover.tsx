// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSwipeable } from "react-swipeable";
// import { User, LogOut, Home as HomeIcon, Heart, Settings } from "lucide-react";

// interface Card {
//   id: number;
//   title: string;
//   description: string;
//   imageUrl: string;
// }

// const Discover = () => {
//   const navigate = useNavigate();
//   const [cards, setCards] = useState<Card[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Fetch cards from the backend
//   useEffect(() => {
//     const fetchCards = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/cards");
//         const data = await response.json();
//         setCards(data);
//       } catch (error) {
//         console.error("Error fetching cards:", error);
//       }
//     };

//     fetchCards();
//   }, []);

//   // Handle swipe actions
//   const handleSwipe = (direction: string) => {
//     if (currentIndex >= cards.length) return;

//     const card = cards[currentIndex];
//     console.log(`Swiped ${direction} on card ${card.id}`);

//     // Send swipe decision to the backend
//     fetch("http://localhost:5000/api/swipe", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ cardId: card.id, direction }),
//     }).catch((error) => console.error("Error sending swipe:", error));

//     // Move to the next card
//     setCurrentIndex((prevIndex) => prevIndex + 1);
//   };

//   const handleLogout = () => {
//     console.log("Logging out...");
//     navigate("/");
//   };

//   const swipeHandlers = useSwipeable({
//     onSwipedLeft: () => handleSwipe("left"),
//     onSwipedRight: () => handleSwipe("right"),
//     preventScrollOnSwipe: true,
//     trackMouse: true, // Allows swiping with a mouse
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white flex flex-col">
//       {/* Top Section */}
//       <header className="flex justify-between items-center p-4">
//         <div className="flex items-center gap-2">
//           <User className="w-6 h-6" />
//           <span className="text-sm font-medium">Profile</span>
//         </div>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500"
//         >
//           <LogOut className="w-5 h-5" />
//           Logout
//         </button>
//       </header>

//       {/* Middle Section */}
//       <main className="flex-1 flex flex-col items-center justify-center px-6">
//         <h1 className="text-2xl font-bold mb-4">Discover New Music</h1>
//         <div
//           className="relative w-full max-w-md h-96"
//           {...swipeHandlers} // Attach swipe handlers to the container
//         >
//           {cards.length > 0 && currentIndex < cards.length ? (
//             <div
//               className="w-full h-full bg-white/10 rounded-lg flex flex-col items-center justify-center p-4"
//               style={{
//                 backgroundImage: `url(${cards[currentIndex].imageUrl})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//               }}
//             >
//               <h2 className="text-xl font-bold text-white">
//                 {cards[currentIndex].title}
//               </h2>
//               <p className="text-sm text-gray-300">
//                 {cards[currentIndex].description}
//               </p>
//             </div>
//           ) : (
//             <p className="text-gray-400">No more cards to swipe!</p>
//           )}
//         </div>
//       </main>

//       {/* Bottom Navigation */}
//       <nav className="bg-black/70 backdrop-blur-md h-16 flex items-center justify-around">
//         <button
//           onClick={() => navigate("/home")}
//           className="flex flex-col items-center text-white"
//         >
//           <HomeIcon className="w-6 h-6" />
//           <span className="text-xs mt-1">Home</span>
//         </button>
//         <button
//           onClick={() => navigate("/discover")}
//           className="flex flex-col items-center text-white"
//         >
//           <Heart className="w-6 h-6" />
//           <span className="text-xs mt-1">Discover</span>
//         </button>
//         <button
//           onClick={() => navigate("/liked")}
//           className="flex flex-col items-center text-white"
//         >
//           <Heart className="w-6 h-6" />
//           <span className="text-xs mt-1">Liked Songs</span>
//         </button>
//         <button
//           onClick={() => navigate("/settings")}
//           className="flex flex-col items-center text-white"
//         >
//           <Settings className="w-6 h-6" />
//           <span className="text-xs mt-1">Settings</span>
//         </button>
//       </nav>
//     </div>
//   );
// };

// export default Discover;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Home as HomeIcon, Search, Heart, Settings } from "lucide-react";

interface Card {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const Discover = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);

  // Load mock data locally
  useEffect(() => {
    const mockData: Card[] = [
      {
        id: 1,
        title: "Song of the Wind",
        description: "A breezy track to lift your spirits.",
        imageUrl: "https://i.ytimg.com/vi/F7AbmXe9thg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBnjKNuGdkhBTPJlk7XiS6OwH3X3Q",
      },
      {
        id: 2,
        title: "Rhythm of the Night",
        description: "Dance to the beat of this night anthem.",
        imageUrl: "https://source.unsplash.com/random/400x600?music2",
      },
      {
        id: 3,
        title: "Chill Vibes",
        description: "Relax and unwind with chill beats.",
        imageUrl: "https://source.unsplash.com/random/400x600?music3",
      },
    ];
    setCards(mockData);
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= cards.length) return;

    setLastDirection(direction);
    setSwipeDirection(direction);

    setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 50);
  };

  // Reset animation state after transition
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
        setLastDirection(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white flex flex-col">
      {/* Top Section */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6" />
          <span className="text-sm font-medium">Profile</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </header>

      {/* Card Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Discover New Music</h1>
        <div className="relative w-full max-w-md h-96" {...swipeHandlers}>
          <AnimatePresence>
            {cards.length > 0 && currentIndex < cards.length && (
              <motion.div
                key={cards[currentIndex].id}
                className="absolute w-full h-full bg-white/10 rounded-lg flex flex-col items-center justify-end p-4 shadow-lg"
                style={{
                  backgroundImage: `url(${cards[currentIndex].imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                initial={{ x: swipeDirection === "right" ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: lastDirection === "right" ? 300 : -300, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-white">
                  {cards[currentIndex].title}
                </h2>
                <p className="text-sm text-gray-300">
                  {cards[currentIndex].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {currentIndex >= cards.length && (
            <p className="text-center text-gray-400">No more cards to swipe!</p>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-black/70 backdrop-blur-md h-16 flex items-center justify-around">
        <button onClick={() => navigate("/home")} className="flex flex-col items-center text-white">
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => navigate("/discover")} className="flex flex-col items-center text-white">
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Discover</span>
        </button>
        <button onClick={() => navigate("/liked")} className="flex flex-col items-center text-white">
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Liked</span>
        </button>
        <button onClick={() => navigate("/settings")} className="flex flex-col items-center text-white">
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default Discover;
