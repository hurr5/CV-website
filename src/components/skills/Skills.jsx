import { SkillSection } from "./SkillSection";
import { Divider } from "../common/Divider.jsx";
import { useTranslation } from 'react-i18next'
import skills from "./data.json"

export const Skills = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <section className="skills max-w-lg cursor-default">
      <Divider title={t("skills.sectionTitle")} />

      {skills.map((skill, idx) => <SkillSection key={idx} title={skill.title} skills={skill.skills} />)}

    </section>
  );
}