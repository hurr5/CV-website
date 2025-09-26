

export const Divider = ({ title }) => {

  return (
    <div className="flex items-center gap-4 mb-6 mt-12">
      <h2 className="text-sm font-medium tracking-wider uppercase text-black/60 dark:text-white/60">
        {title}
      </h2>
      <div className="flex-1 h-[1px] bg-black dark:bg-white/20">
      </div>
    </div>
  )
}

