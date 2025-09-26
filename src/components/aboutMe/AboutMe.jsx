import { useEffect } from "react";
import { useTranslation } from "react-i18next";


const AboutMe = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const lang = localStorage.getItem("lang");
    i18n.changeLanguage(lang);
  }, []);

  return (
    <section className="about-me text-black/80 dark:text-white/80 text-md mt-12">
      <div>
        <p><span className="font-medium">{t("aboutMe.firstLine")}</span> {t("aboutMe.secondLine")} <a className="font-medium underline hover:text-orange-500 transition-colors" href="https://t.me/hurricane751" target="_blank">{t("aboutMe.contact")}</a> </p>
      </div>
    </section>
  );
}

export default AboutMe;