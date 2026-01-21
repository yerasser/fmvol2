import React from "react";

export default function Header() {
    return (
        <div className="font-['Nunito_Sans'] my-6 sm:my-8 expand px-4">
            <div className="relative flex items-end justify-center sm:justify-start">
                <div
                    className="
                        absolute
                        -top-2 sm:-top-1
                        left-0 sm:left-1
                        text-[12px] sm:text-[14px] md:text-[18px]
                        font-extrabold
                        leading-none
                        tracking-[0.02em]
                        text-[#7a7a7a]
                    "
                >
                    by FM
                </div>
                <div
                    className="
                        text-[32px]
                        sm:text-[44px]
                        md:text-[56px]
                        lg:text-[64px]
                        font-extrabold
                        leading-[0.95] md:leading-[0.9]
                        tracking-[-0.02em]
                        text-[#2b2b2b]
                        text-center sm:text-left
                    "
                >
                    popping battle
                </div>

                <div
                    className="
                        absolute
                        -bottom-4 sm:-bottom-5
                        right-0
                        text-[14px] sm:text-[18px] md:text-[22px]
                        font-extrabold
                        leading-none
                        tracking-[0.02em]
                        text-[#7a7a7a]
                    "
                >
                    vol. 2
                </div>
            </div>
        </div>
    );
}
