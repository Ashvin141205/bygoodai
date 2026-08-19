import React, { useState } from "react";

const MultipleFaq = ({ index, openIndex, toggleFAQItem, question, answer }) => {
    const isOpen = openIndex === index;

    const [openIndex12, setOpenIndex12] = useState(null);

    const toggleFAQItem12 = (index) => {
        setOpenIndex12(openIndex12 === index ? null : index);
    };


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
                    <div className="px-1">
                        <div className="wow fadeInUp space-y-1">
                            <Item
                                index={0}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`Should I verify my account on a daily basis?`}
                                answer={`When you sign up at Lucky Charm Sweep, you are asked to verify your account. Depending on how much you deposit at the platform over a year span, you will complete the verification process a few times.`}
                            />

                            <Item
                                index={1}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`What are the details regarding verification and the impact of the deposit amount on them?`}
                                answer={`Players who initially deposited less than $500 need to verify their Luck Charm Sweep accounts every month. If they deposited more than $500 up to $5.000, they only need to verify their gaming account twice a year. Moreover, users who deposit more than $5.000 up to $50.000 only need to verify the account once a year.`}
                            />

                            <Item
                                index={2}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`In which case can I avoid verification?`}
                                answer={`You can avoid the verification process as a whole once your deposit amount exceeds $50.000. The other option for players to avoid verification is by withdrawing 4 times less than what they actually deposited. So, if your total withdrawal amount is 4 times less than your total deposits at the platform, you do not have to complete the verification process at Luck Charm Sweep.`}
                            />

                            <Item
                                index={3}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`Are withdrawal terms also applicable for winnings through a signup bonus?`}
                                answer={`Yes, you still need to get verified to withdraw the amount. However, if you accumulated rewards by just using the signup bonus and without actually depositing, you will have a daily withdrawal limit of $100.`}
                            />

                            <Item
                                index={4}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`Which Steps do I need to take to get verified on Luck Charm Sweep?`}
                                answer={`To get verified on Luck Charm Sweep, all you need to do is to submit a selfie while holding your ID card. This is applicable to users who deposited, won, and tried to withdraw the amount. On the other hand, for users who did not make a deposit and won through using the sign-up bonus, the verification steps are a little bit different.`}
                            />


                            <Item
                                index={5}
                                openIndex={openIndex12}
                                toggleFAQItem={toggleFAQItem12}
                                question={`How do I get verified if I am trying to withdraw the amount that I earned through the signup bonus without making a deposit?`}
                                answer={`To start the process, you need to provide a selfie with your ID Card while holding a paper on which the date of the verification and the website that you are trying to get verified is written. Make sure that the image is clear and the scripts on the paper are visible. Otherwise, it can delay the verification process. To finalize, submit the documents and check your email afterward to get updates.`}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultipleFaq;

const Item = ({ index, openIndex, toggleFAQItem, question, answer, answer2 = '', link = '', answer3 = '' }) => {
    const isOpen = openIndex === index;

    return (
        <div className="flex flex-col text-white bg-[#222222]">
            <h3
                className="flex cursor-pointer items-center justify-between py-5 text-[16px] md:text-[18px] font-semibold leading-[28px]"
                onClick={() => toggleFAQItem(index)}
            >
                {question}
                <span>
                    <svg
                        className={`fill-current transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                        width="20"
                        height="20"
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
                className={`text-body-color  grid text-base transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
            >
                <div className="overflow-hidden transition-all duration-300">
                    <div className="pb-6 pt-1 text-sm md:text-base">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
};
