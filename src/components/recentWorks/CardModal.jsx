import { useState, useEffect } from "react"
import "./cardModal.css"
import list from "../skills/data.json"


export const CardModal = ({ data, onClose, image }) => {

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalStyle
    }
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 ease-out animate-fadeIn"></div>

      <div onClick={() => onClose(false)} className="
      fixed inset-0 flex items-center 
      justify-center dark:text-white z-50">
        <div onClick={e => e.stopPropagation()} className="
          relative w-4xl h-[60vh] border border-white/20
          p-12 rounded-2xl backdrop-blur-sm
          bg-black/20 transform transition-all duration-300
          ease-out animate-scaleIn overflow-scroll">
          <div className="modal__close" onClick={() => onClose(false)}></div>
          <div className="modal__header flex justify-between">
            <div className="modal__info">
              <a href={data.github} target="_blank" className="inline-flex items-center 
              gap-2 cursor-pointer text-white/60 
              hover:text-orange-500 transition-colors">
                <h2 className="inline text-xl border-b-2 border-dotted">{data.title}</h2>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24px" fill="currentColor"><path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z" /></svg>
              </a>
              <br />
              {data.link ? <a href={data.link} target="_blank" className="inline-flex mt-3 items-center 
              gap-2 cursor-pointer text-white/60 
              hover:text-orange-500 transition-colors">
                <h2 className="inline text-xl border-b-2 border-dotted">{data.title}</h2>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24px" fill="currentColor" ><path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z" /></svg>
              </a> : null}
              <div
                onClick={() => setExpanded(prev => !prev)}
                className="mt-5 border-t border-b max-w-50 border-white/40 py-3 flex items-center justify-between cursor-pointer">
                <span
                  className="cursor-pointer text-xl"
                >
                  DESCRIPTION
                </span>
                <span
                  className={`cursor-pointer text-2xl font-bold select-none transition-all duration-500 origin-center ${expanded ? 'rotate-45' : null}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24px" fill="currentColor"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" /></svg>
                </span>
              </div>
              <div className={`relative mt-5 max-w-120 text-base 
                overflow-hidden transition-all duration-500 
                ${expanded ? "max-h-[500px]" : "max-h-18"}`}>
                <p>
                  {data.description}
                </p>
              </div>
            </div>
            <div className="modal__technologies ">
              <div className={`modal__technologies text-white flex flex-wrap max-w-100 gap-3`}>
                {data.skills.map(skill => (
                  <span key={skill} className={`skill p-2 bg-black/30 dark:bg-white/10 
                  rounded-md hover:bg-orange-500/70 transition-colors text-center h-10`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* <img
            src={image}
            alt="project"
            className={`rounded-lg transition-all duration-500 ease-in-out 
    ${expanded ? "w-32 h-32" : "w-full h-64"} 
    object-contain mx-auto`}
          /> */}
        </div>
      </div >
    </>
  )
}