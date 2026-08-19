import React, { Suspense, lazy } from 'react'
import FaqBg from '../../../assets/image/blogBg.png'
import Hero from '../../../components/Hero'
import SkeletonSection from '../../../components/Common/SkeletonSection'

const FaqContent = lazy(() => import('../../../components/Faq/index'))

const Faq = () => {
  return (
    <>
      <Hero bgImg={FaqBg} title={"FAQ"} />
      <Suspense fallback={<div className='container mx-auto px-4 my-8'><SkeletonSection heightClass='h-80' /></div>}>
        <FaqContent />
      </Suspense>
    </>
  )
}

export default Faq
