import React from 'react'
import { Link } from 'react-router-dom'

const JoinToday = () => {
    return (
        <div className='container mx-auto py-5'>
            <div className='border border-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between'>
                <Link to="/sign-up" className='flex items-center p-5 gap-3 hover:bg-gray-800/30 transition-colors rounded-l-2xl'>
                    <div className='bg-[#FFDD15] h-11 w-11 rounded-full flex justify-center items-center text-lg font-bold'>1</div>
                    <div className='flex flex-col'>
                        <p className='text-white font-bold'>Join Today</p>
                        <p className='text-[#CACACA]'>Deposit $10</p>
                    </div>
                </Link>
                <Link to="/deposit-bonus" className='flex items-center md:justify-center p-5 gap-3 hover:bg-gray-800/30 transition-colors'>
                    <div className='bg-[#FFDD15] h-11 w-11 rounded-full flex justify-center items-center text-lg font-bold'>2</div>
                    <div className='flex flex-col'>
                        <p className='text-white font-bold'>Get $10 Bonus</p>
                        <p className='text-[#CACACA]'>Play with $20 total</p>
                    </div>
                </Link>
                <Link to="/slots" className='flex items-center md:justify-center p-5 gap-3 hover:bg-gray-800/30 transition-colors rounded-r-2xl'>
                    <div className='bg-[#FFDD15] h-11 w-11 rounded-full flex justify-center items-center text-lg font-bold'>3</div>
                    <div className='flex flex-col'>
                        <p className='text-white font-bold'>Play Games</p>
                        <p className='text-[#CACACA]'>3000+ Top Games</p>
                    </div>
                </Link>

            </div>
        </div>
    )
}

export default JoinToday