import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useOutsideClick } from "rooks";

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

    i18n.changeLanguage(lang);
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <nav
      className={`mx-auto mt-10 border rounded-2xl p-3 flex justify-center items-center gap-3 w-fit ${isDark
        ? "border-white/10 text-white/50 bg-transparent"
        : "border-black/10 text-black/50 bg-transparent"
        }`}
    >
      <div className="header__links flex items-center gap-5 ">
        <a
          href="#"
          className="flex items-center gap-2 hover:text-black dark:hover:text-white whitespace-nowrap transition-colors"
        >
          {t("header.about")}
        </a>
        <a
          href="#"
          className="flex items-center gap-2 hover:text-black dark:hover:text-white whitespace-nowrap transition-colors"
        >
          {t("header.projects")}
        </a>
        <a
          href="#"
          className="flex items-center gap-2 hover:text-black dark:hover:text-white whitespace-nowrap transition-colors"
        >
          {t("header.contacts")}
        </a>
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
              🇷🇺
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
              🇺🇸
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
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="18"
              width="18"
              viewBox="0 0 512 512"
              fill="currentColor"
            >
              <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512c68.8 0 131.3-27.2 177.3-71.4 7.3-7 9.4-17.9 5.3-27.1s-13.7-14.9-23.8-14.1c-4.9 .4-9.8 .6-14.8 .6-101.6 0-184-82.4-184-184 0-72.1 41.5-134.6 102.1-164.8 9.1-4.5 14.3-14.3 13.1-24.4S322.6 8.5 312.7 6.3C294.4 2.2 275.4 0 256 0z" />
            </svg>
          ) : (
            <svg
              width="18px"
              height="18px"
              viewBox="0 0 15 15"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.22386 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav >
  );
};

export default Header;