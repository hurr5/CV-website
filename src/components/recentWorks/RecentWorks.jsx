import { Divider } from "../common/Divider"
import { WorkCard } from "./WorkCard"
import exchanger from "../../assets/exchanger.webp"
import works from "./data.json"



export const RecentWorks = () => {
  console.log(exchanger)
  return (
    <section className="works">
      <Divider title="Recent Works" />
      {works.map((item, idx) => (
        <WorkCard key={item.title} data={item} projectName={item.title} image={exchanger} />
      ))}
    </section>
  )
}