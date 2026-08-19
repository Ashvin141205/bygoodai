import React from "react";
import { Link } from "react-router-dom";

const FaqItem = ({ index, openIndex, toggleFAQItem, question, answer, answer2 = '', link = '', answer3 = '' }) => {
    const isOpen = openIndex === index;

    return (
        <div className="flex flex-col border-b border-white/[0.15] text-white bg-[#222222] px-6 rounded-md">
        <h3
          className="flex cursor-pointer items-center justify-between py-5 text-[16px] md:text-[20px] font-semibold leading-[28px]"
          onClick={() => toggleFAQItem(index)}
        >
          {question}
          <span>
            <svg
              className={`fill-current transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 11.1752H12.8625V1.5002C12.8625 1.0502 12.4875 0.637695 12 0.637695C11.55 0.637695 11.1375 1.0127 11.1375 1.5002V11.1752H1.50001C1.05001 11.1752 0.637512 11.5502 0.637512 12.0377C0.637512 12.4877 1.01251 12.9002 1.50001 12.9002H11.175V22.5002C11.175 22.9502 11.55 23.3627 12.0375 23.3627C12.4875 23.3627 12.9 22.9877 12.9 22.5002V12.8627H22.5C22.95 12.8627 23.3625 12.4877 23.3625 12.0002C23.3625 11.5502 22.95 11.1752 22.5 11.1752Z"
                fill=""
              />
            </svg>
          </span>
        </h3>
        <div
          className={`text-body-color grid text-base transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
        >
          <div className="overflow-hidden transition-all duration-300">
            <div className="pb-6 pt-1 text-sm md:text-base">
              {answer}
              {
              link  && <Link to={"#"} className="pl-1">{link}</Link>
            }
              </div>
            
           {
            answer2 &&  <div className="pb-6 pt-1 text-sm md:text-base">{answer2}</div>
           }

           {
            answer3 &&  <div className="pb-6 pt-1 text-sm md:text-base">{answer3}</div>
           }
          </div>
        </div>
      </div>
    );
};

export default FaqItem;
