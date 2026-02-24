import { useState, useRef } from "react"
import { Divider } from "../common/Divider"
import { useTranslation } from 'react-i18next'
import { FlappyBird } from "../flappyBird/FlappyBird"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faMobile } from "@fortawesome/free-solid-svg-icons"

import './glow.css'
import data from "./links.json"

const GLITCH_CHARS = '!<>-_\\/[]{}=+*^?#@$%&~';

const icons = {
  faTelegram,
  faGithub,
  faLinkedin,
  faEnvelope,
  faMobile,
}

export const Footer = () => {
  const { t } = useTranslation()
  const [scrambled, setScrambled] = useState(null)
  const animating = useRef(false)

  const handleNameClick = () => {
    if (animating.current) return
    animating.current = true

    const name = t("contacts.name")
    const letters = name.split('')
    const nonSpaces = letters.filter(c => c !== ' ').length
    let revealed = 0

    setScrambled(letters.map(c =>
      c === ' ' ? ' ' : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    ))

    letters.forEach((letter, i) => {
      if (letter === ' ') return
      let count = 0
      setTimeout(() => {
        const iv = setInterval(() => {
          count++
          if (count >= 5) {
            clearInterval(iv)
            setScrambled(prev => {
              if (!prev) return null
              const next = [...prev]
              next[i] = letter
              return next
            })
            revealed++
            if (revealed === nonSpaces) {
              setTimeout(() => {
                setScrambled(null)
                animating.current = false
              }, 300)
            }
          } else {
            setScrambled(prev => {
              if (!prev) return null
              const next = [...prev]
              next[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              return next
            })
          }
        }, 45)
      }, i * 40)
    })
  }

  return (
    <footer className="min-h-70" id="contacts">
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
      <FlappyBird />
      <span
        onClick={handleNameClick}
        className="block footer-name mt-20 mb-10 text-center dark:text-white cursor-pointer select-none"
      >
        {scrambled ? scrambled.join('') : t("contacts.name")}
      </span>
    </footer>
  )
}