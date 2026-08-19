import React from 'react'
import BlogBg from '../../../assets/image/blogBg.png'
import Hero from '../../../components/Hero'
import MainContent from "./MainContent"

const Games = () => {
    return (
        <>
            <Hero bgImg={BlogBg} title={"Games"} />
            <MainContent />
        </>
    )
}

export default Games
