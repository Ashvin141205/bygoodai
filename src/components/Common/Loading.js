import React from 'react'
import Loader from '../../assets/Loader.gif'

function Loading() {
  return (
    <>
      <div className="load" style={{ height: '100vh', width: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={Loader} alt="loader loading" width={150}/>
      </div>
    </>
  )
}

export default Loading;
