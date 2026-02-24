import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useOutsideClick } from "rooks";
import { US, RU } from 'country-flag-icons/react/3x2';
import { Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";


const Header = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ru");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const ref = useRef()
  useOutsideClick(ref, () => setLangMenuOpen(false))

  const { t, i18n } = useTranslation();

  const changeLang = (lang) => {
    setLang(lang);
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const linkClass = "flex items-center gap-2 hover:text-black dark:hover:text-white whitespace-nowrap transition-colors";

  return (
    <nav
      className={`mx-auto mt-10 border rounded-2xl p-3 flex justify-center items-center gap-3 w-fit ${isDark
        ? "border-white/10 text-white/50 bg-transparent"
        : "border-black/10 text-black/50 bg-transparent"
        }`}
    >
      <div className="header__links flex items-center gap-5 ">
        <a href="/" className={linkClass}>
          {t("header.about")}
        </a>
        <a href="/#works" className={linkClass}>
          {t("header.projects")}
        </a>
        <a href="/#contacts" className={linkClass}>
          {t("header.contacts")}
        </a>
        <Link to="/games" className={linkClass}>
          {t("header.games")}
        </Link>
      </div>

      <div className="h-6 w-[1px] bg-current/20"></div>

      <div ref={ref} className="relative header__language flex items-center gap-2">
        <button
          onClick={() => setLangMenuOpen(prev => !prev)}
          className="transition-colors cursor-pointer hover:text-black dark:hover:text-white flex items-center gap-1"
        >
          <span className="text-white">{lang === "RU" ? "" : ""}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M192 64C209.7 64 224 78.3 224 96L224 128L352 128C369.7 128 384 142.3 384 160C384 177.7 369.7 192 352 192L342.4 192L334 215.1C317.6 260.3 292.9 301.6 261.8 337.1C276 345.9 290.8 353.7 306.2 360.6L356.6 383L418.8 243C423.9 231.4 435.4 224 448 224C460.6 224 472.1 231.4 477.2 243L605.2 531C612.4 547.2 605.1 566.1 589 573.2C572.9 580.3 553.9 573.1 546.8 557L526.8 512L369.3 512L349.3 557C342.1 573.2 323.2 580.4 307.1 573.2C291 566 283.7 547.1 290.9 531L330.7 441.5L280.3 419.1C257.3 408.9 235.3 396.7 214.5 382.7C193.2 399.9 169.9 414.9 145 427.4L110.3 444.6C94.5 452.5 75.3 446.1 67.4 430.3C59.5 414.5 65.9 395.3 81.7 387.4L116.2 370.1C132.5 361.9 148 352.4 162.6 341.8C148.8 329.1 135.8 315.4 123.7 300.9L113.6 288.7C102.3 275.1 104.1 254.9 117.7 243.6C131.3 232.3 151.5 234.1 162.8 247.7L173 259.9C184.5 273.8 197.1 286.7 210.4 298.6C237.9 268.2 259.6 232.5 273.9 193.2L274.4 192L64.1 192C46.3 192 32 177.7 32 160C32 142.3 46.3 128 64 128L160 128L160 96C160 78.3 174.3 64 192 64zM448 334.8L397.7 448L498.3 448L448 334.8z" />
          </svg>
        </button>
        {langMenuOpen && (
          <div className="absolute top-full mt-2
          -translate-x-4 transform
          border border-black/15
          dark:border-white/15 rounded-md
          overflow-hidden bg-transparent text-white backdrop-blur-sm z-10">
            <button
              onClick={() => {
                changeLang("ru")
                setLangMenuOpen(!langMenuOpen)
              }}
              className="block w-full text-left px-4 py-2
              cursor-pointer
              hover:bg-black/10 dark:hover:bg-white/10"
            >
              <RU title="Russian" className="w-4 h-5"/>
            </button>
            <button
              onClick={() => {
                changeLang("en")
                setLangMenuOpen(!langMenuOpen)
              }}
              className="block w-full text-left px-4 py-2
              cursor-pointer
              hover:bg-black/10 dark:hover:bg-white/10"
            >
              <US title="English" className="w-4 h-5"/>
            </button>
          </div>
        )}
      </div>

      <div className="h-6 w-[1px] bg-current/20"></div>

      <div className="header__theme flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="transition-colors cursor-pointer hover:text-black dark:hover:text-white"
        >
          {isDark ? <Moon /> : <Sun /> }
        </button>
      </div>
    </nav >
  );
};

export default Header;
