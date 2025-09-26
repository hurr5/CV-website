import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      header: {
        about: "Обо мне",
        projects: "Проекты",
        contacts: "Контакты"
      },
      aboutMe: {
        firstLine: "Привет, меня зовут Михаил.",
        secondLine: " Я разрабатываю веб-приложения на React. Проживаю в Краснодаре.",
        contact: " Связаться"
      }
    }
  },
  en: {
    translation: {
      header: {
        about: "Home",
        projects: "Projects",
        contacts: "Contacts"
      },
      aboutMe: {
        firstLine: "Hey there, I'm Mikhail.",
        secondLine: " I develop web applications using React. I live in Krasnodar, Russia.",
        contact: " Get in touch"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;