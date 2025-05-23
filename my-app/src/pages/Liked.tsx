import React from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Home as HomeIcon, Search, Heart, Settings } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session (if applicable) and navigate to login
    console.log("Logging out...");
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

      {/* Middle Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold mb-4">Your previously liked songs</h1>
        <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Your music player will go here</p>
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
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Discover</span>
        </button>
        <button
          onClick={() => navigate("/liked")}
          className="flex flex-col items-center text-white"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Liked</span>
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

export default Home;