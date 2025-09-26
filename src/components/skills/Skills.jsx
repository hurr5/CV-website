import { SkillSection } from "./SkillSection";
import { Divider } from "../common/Divider.jsx";
import skills from "./data.json"

export const Skills = () => {

  return (
    <section className="skills max-w-lg cursor-default">
      <Divider title="Skills" />

      {skills.map((skill, idx) => <SkillSection key={idx} title={skill.title} skills={skill.skills} />)}

    </section>
  );
}