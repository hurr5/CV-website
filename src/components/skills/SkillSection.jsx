import { useState, useMemo } from "react";
import { ChevronUp } from "lucide-react";

export const SkillSection = ({ title, skills }) => {
  const [open, setOpen] = useState(false);

  const renderSkills = useMemo(() => {
    return skills.map(skill => (
      <div key={skill} className="skill p-2 bg-black/30 dark:bg-white/10 rounded-md hover:bg-orange-500/70 transition-colors">
        {skill}
      </div>
    ))
  }, [skills])

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((value) => !value)}
        className="text-sm font-medium tracking-wider uppercase text-black dark:text-white hover:text-orange-500 color-transition duration-300 cursor-pointer">
        <ChevronUp className={`mr-3 w-4 h-4 inline duration-200 ease-in-out ${open ? "rotate-180" : ""}`}/>
        {title}
        <span className="ml-2 text-black/50 dark:text-white/50 border border-black/10 dark:border-white/20 rounded-md p-1">
          {skills.length}
        </span>
      </button>

      <div className={`grid transition-all duration-500 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="skills__list text-white flex flex-wrap gap-3 mt-5">
            {renderSkills}
          </div>
        </div>
      </div>
    </div>
  )
}