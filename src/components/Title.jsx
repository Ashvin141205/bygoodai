import React from 'react'

const Title = ({ title, continueTitle, br = false }) => {
    return (
        <h2 className="text-center text-white text-3xl underline font-bold mt-5">
            {title} {br && <br />}
            <span className="text-[#FFDD15] underline"> {continueTitle}</span>
        </h2>
    )
}

export default Title