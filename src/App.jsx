import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/header/Header.jsx";
import AboutMe from "./components/aboutMe/AboutMe.jsx";
import { Skills } from "./components/skills/Skills.jsx";
import { Footer } from "./components/footer/Footer.jsx";
import "./App.css";
import { RecentWorks } from "./components/recentWorks/RecentWorks.jsx";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import GamesPage from "./pages/GamesPage.jsx";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={
          <div className="relative container mx-auto max-w-xl px-4 sm:pl-5 sm:pr-5 min-h-screen transition-colors">
            <Header />
            <AboutMe />
            <Skills />
            <RecentWorks />
            <Footer />
          </div>
        } />
        <Route path="/games" element={<GamesPage />} />
      </Routes>
    </>
  );
}

export default App;
