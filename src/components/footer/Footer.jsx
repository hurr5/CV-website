import { Divider } from "../common/Divider"
import { useTranslation } from 'react-i18next'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faMobile } from "@fortawesome/free-solid-svg-icons"

import './glow.css'
import data from "./links.json"

const icons = {
  faTelegram,
  faGithub,
  faLinkedin,
  faEnvelope,
  faMobile,
}

export const Footer = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <footer className="min-h-70">
      <Divider title={t("contacts.sectionTitle")} />
      <div className="links flex justify-around gap-2">
        {data.map((item, idx) => (
          <a
            href={item.link}
            key={idx}
            target="_blank"
            aria-label={item.alt}
            className="glow dark:text-white/50 hover:dark:text-white transition-colors duration-1000 text-2xl text-center w-20">
            <FontAwesomeIcon icon={icons[item.icon]} />
            <div className="text-sm">
              {item.alt}
            </div>
          </a>
        ))}
      </div>
      <span className="block footer-name mt-20 text-center dark:text-white">
        {t("contacts.name")}
      </span>
    </footer>
  )
}