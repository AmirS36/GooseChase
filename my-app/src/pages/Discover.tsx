import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { User, LogOut, Home as HomeIcon, Heart, Settings } from "lucide-react";

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

  // Fetch cards from the backend
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cards");
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error("Error fetching cards:", error);
      }
    };

    fetchCards();
  }, []);

  // Handle swipe actions
  const handleSwipe = (direction: string) => {
    if (currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    console.log(`Swiped ${direction} on card ${card.id}`);

    // Send swipe decision to the backend
    fetch("http://localhost:5000/api/swipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cardId: card.id, direction }),
    }).catch((error) => console.error("Error sending swipe:", error));

    // Move to the next card
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/");
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true, // Allows swiping with a mouse
  });

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

      {/* Middle Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Discover New Music</h1>
        <div
          className="relative w-full max-w-md h-96"
          {...swipeHandlers} // Attach swipe handlers to the container
        >
          {cards.length > 0 && currentIndex < cards.length ? (
            <div
              className="w-full h-full bg-white/10 rounded-lg flex flex-col items-center justify-center p-4"
              style={{
                backgroundImage: `url(${cards[currentIndex].imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="text-xl font-bold text-white">
                {cards[currentIndex].title}
              </h2>
              <p className="text-sm text-gray-300">
                {cards[currentIndex].description}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">No more cards to swipe!</p>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-black/70 backdrop-blur-md h-16 flex items-center justify-around">
        <button
          onClick={() => navigate("/home")}
          className="flex flex-col items-center text-white"
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => navigate("/discover")}
          className="flex flex-col items-center text-white"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Discover</span>
        </button>
        <button
          onClick={() => navigate("/liked")}
          className="flex flex-col items-center text-white"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Liked Songs</span>
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="flex flex-col items-center text-white"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default Discover;