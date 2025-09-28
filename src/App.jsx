// App.jsx
import { useEffect } from "react";
import Header from "./components/header/Header.jsx";
import AboutMe from "./components/aboutMe/AboutMe.jsx";
import { Skills } from "./components/skills/Skills.jsx";
import { Footer } from "./components/footer/Footer.jsx"
import "./App.css";
import { RecentWorks } from "./components/recentWorks/RecentWorks.jsx";

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
    <div className="relative container mx-auto max-w-xl px-4 sm:pl-5 sm:pr-5 min-h-screen transition-colors over">
      <Header />
      <AboutMe />
      <Skills />
      <RecentWorks />

      <Footer />
    </div>
  );
}

export default App;