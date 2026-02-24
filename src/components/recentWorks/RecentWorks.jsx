import { Divider } from "../common/Divider"
import { WorkCard } from "./WorkCard"
import { useTranslation } from 'react-i18next'
import works from "./data.json"

export const RecentWorks = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <section className="works" id="works">
      <Divider title={t("recentWorks.sectionTitle")} />
      {works.map((item, idx) => (
        <WorkCard
          key={idx}
          id={idx}
          data={item}
          projectName={lang === "en" ? item.enTitle : item.ruTitle}
          image={item.image ? `/${item.image}.webp` : null}
        />
      ))}
    </section>
  )
}