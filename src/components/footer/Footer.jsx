import { Divider } from "../common/Divider"
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
  return (
    <footer className="min-h-70">
      <Divider title="Contacts" />
      <div className="links flex justify-around">
        {data.map((item, idx) => (
          <a
            href={item.link}
            key={idx}
            target="_blank"
            aria-label={item.alt}
            className="glow dark:text-white/50 hover:dark:text-white transition-colors duration-1000 text-2xl text-center">
            <FontAwesomeIcon icon={icons[item.icon]} />
            <div className="text-sm">
              {item.alt}
            </div>
          </a>
        ))}
      </div>
      <span className="block footer-name mt-20 text-center dark:text-white">
        Mikhail Arkhangelskii
      </span>
      <div className="footer-glow"></div>

    </footer>
  )
}