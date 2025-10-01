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
      },
      skills: {
        sectionTitle: "Навыки"
      },
      recentWorks: {
        sectionTitle: "Последние работы"
      },
      cardModal: {
        link: "Опробовать",
        desc: "Описание"
      },
      contacts: {
        sectionTitle: "Контакты",
        name: "Михаил Архангельский"
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
      },
      skills: {
        sectionTitle: "Skills"
      },
      recentWorks: {
        sectionTitle: "Recent works"
      },
      cardModal: {
        link: "Try by yourself",
        desc: "Description"
      },
      contacts: {
        sectionTitle: "Contacts",
        name: "Mikhail Arkhangelskii"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;