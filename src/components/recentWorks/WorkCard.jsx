import { CardModal } from "./CardModal"
import { useState } from "react"
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js'


export const WorkCard = ({ data, projectName, image }) => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      <Tippy
        placement={'right'}
        offset={[50, -240]}
        duration={0}
        hideOnClick={false}
        content={
          <div className="max-w-60 max-h-60 pb-2 
          rounded-2xl overflow-hidden
          border-1 border-white/60 backdrop-blur-md">
            <img src={`/${data.image}.webp`} className="max-w-60 mx-auto " alt={data.title} />
            <div>
              <h3 className="text-white pl-2 pt-1">
                {data.title}
              </h3>
              <p className="block text-gray-400 text-xs pl-3 ">{data.shortDesc}</p>
            </div>
          </div>
        }>
        <div className="card w-full mt-5" onClick={() => setOpenModal(true)}>
          <div className="dark:color-white flex justify-between cursor-pointer
        hover:color-white
        dark:text-white/60 dark:hover:text-white
        dark:hover:bg-white/10 transition-colors
        p-4 rounded-2xl group
        ">
            <span>{projectName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="group-hover:translate-x-3 transition-all duration-300" width="30px" fill="currentColor">
              <path d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z" />
            </svg>
          </div>
        </div >
      </Tippy>
      {openModal ? <CardModal data={data} image={image} onClose={() => setOpenModal(false)} /> : null}
    </>
  )
}
