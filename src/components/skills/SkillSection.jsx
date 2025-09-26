import { useState } from "react";

export const SkillSection = ({ title, skills }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-medium tracking-wider uppercase text-black dark:text-white hover:text-orange-500 color-transition duration-300">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" aria-hidden="true" className={`mr-3 w-4 h-4 inline duration-200 ease-in-out ${open ? "rotate-180" : null}`} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd">s
          </path>
        </svg>
        {title}
        <span className="ml-2 bg-black/10 dark:bg-white/10 rounded-md p-2">
          {`${skills.length}`}
        </span>
      </button>

      <div style={{ maxHeight: open ? "140px" : "0" }} className={`transition-all duration-500 overflow-hidden`}>
        <div className={`skills__list text-white flex flex-wrap gap-3 mt-5`}>
          {skills.map(skill => (
            <div key={skill} className="skill p-2 bg-black/3  0 dark:bg-white/10 rounded-md hover:bg-orange-500/70 transition-colors">
              {skill}
            </div>
          ))}
        </div>
      </div>
    </div >
  )
}

