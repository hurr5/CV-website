import { CardModal } from "./CardModal"
import { useState } from "react"
import { Tooltip } from 'react-tooltip'
import { isMobile } from 'react-device-detect'
import { useTranslation } from "react-i18next"
import { MoveRight } from "lucide-react"

import './cardModal.css'

export const WorkCard = ({ data, id, projectName, image }) => {
  const [openModal, setOpenModal] = useState(false)
  const { i18n } = useTranslation()
  const lang = i18n.language

  const title = lang === 'en' ? data.enTitle : data.ruTitle
  const shortDesc = lang === 'en' ? data.enShortDesc : data.ruShortDesc

  return (
    <>
      <div
        className="card w-full mt-5"
        data-tooltip-id={`tooltip-${id}`}
        onClick={() => setOpenModal(true)}>
        <div className="dark:color-white flex justify-between cursor-pointer
        hover:color-white hover:bg-black/10
        dark:text-white/60 dark:hover:text-white
        dark:hover:bg-white/10 transition-colors duration-500
        p-4 rounded-2xl group">
          <span>{projectName}</span>
          <MoveRight className="group-hover:translate-x-3 transition-all duration-300" />
        </div>
      </div>

      {!isMobile && (
        <Tooltip id={`tooltip-${id}`} place="right"
          style={{ backgroundColor: "transparent", padding: 0 }}>
          <div className="w-60 overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur-sm">
            {image && <img src={image} className="w-full h-32 object-cover object-top" alt={title} />}
            <div className="p-3">
              <h3 className="text-white text-sm font-medium">{title}</h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">{shortDesc}</p>
            </div>
          </div>
        </Tooltip>
      )}

      {openModal && <CardModal data={data} image={image} onClose={() => setOpenModal(false)} />}
    </>
  )
}