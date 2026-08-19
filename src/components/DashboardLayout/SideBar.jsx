import React from 'react'
import { Link } from 'react-router-dom'
import { SideBonusesIcon, SideBonusleveIcon, SideDashboardIcon, SidePlatformIcon, SideProfileIcon, SiderDepositIcon, SiderGameIcon, SiderMyGameIcon, SiderRedeemIcon, SiderReferralIcon, SiderWithdrawalIcon, SideWalletIcon } from '../../utils/Icons'
// --- NEW IMPORTS ---
import { useDispatch } from 'react-redux';
import { FaCalendarCheck, FaTasks } from 'react-icons/fa'; // --- ADD FaTasks ---
// --- END NEW IMPORTS ---
const SideBar = ({
    isOpen,
    toggleEcommerce,
    isEcommerceOpen,
    toggleSidebar,
    dropdownRef,
    total_count,
    promotion_count,
    system_count
}) => {
    const dispatch = useDispatch();
    return (
        <>
            <aside
                ref={dropdownRef}
                className={`absolute bottom-0 top-0 left-0 z-40 w-80 md:w-64 h-[84vh] md:h-[115vh] transition-transform ${isOpen ? "translate-x-0" : '-translate-x-full'}  md:translate-x-0 py-4 pl-4`} aria-label="Sidebar"
            >
                <div className="h-full py-4 overflow-y-auto main-dot-bg">
                    <ul className="space-y-1 font-medium text-base">
                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/dashboard" className="flex items-center p-2 rounded-lg text-white  bg-transparent">
                                <SideDashboardIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Dashboard</span>
                            </Link>
                        </li>


                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/profile" className="flex items-center p-2 rounded-lg text-white  bg-transparent">
                                <SideProfileIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Profile</span>
                            </Link>
                        </li>

                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/bonuses" className="flex items-center p-2  rounded-lg text-white  bg-transparent">
                                <SideBonusesIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Claim Freeplay</span>
                            </Link>
                        </li>

                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/mygames" className="flex items-center p-2  rounded-lg text-white  bg-transparent">
                                <SiderGameIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Game Logins</span>
                            </Link>
                        </li>

                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/bonuses/level" className="flex items-center p-2 rounded-lg text-white  bg-transparent">
                                <SideBonusleveIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Reward Levels</span>
                            </Link>
                        </li>
                        {/* --- ADD THIS NEW LIST ITEM --- */}


                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/request/redeem" className="flex items-center p-2 rounded-lg text-white  bg-transparent">
                                <SiderRedeemIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Cashout Request</span>
                            </Link>
                        </li>
                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/deposit/game" className="flex items-center p-2  rounded-lg text-white  bg-transparent">
                                <SiderMyGameIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Deposit to Game</span>
                            </Link>
                        </li>
                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/all-platform" className="flex items-center p-2  rounded-lg text-white  bg-transparent">
                                <SidePlatformIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Game Platforms</span>
                            </Link>
                        </li>
                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/referrals" className="flex items-center p-2 rounded-lg text-white  bg-transparent">
                                <SiderReferralIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Referrals</span>
                            </Link>
                        </li>

                        <li className='px-3'>
                            <button
                                type="button"
                                className="flex items-center w-full p-2 text-base transition duration-75 rounded-lg  bg-transparent  text-white"
                                aria-controls="dropdown-ecommerce"
                                onClick={toggleEcommerce}
                            >
                                <svg
                                    className="flex-shrink-0 w-5 h-5 text-white transition duration-75"
                                    stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path></svg>
                                <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                                    Message
                                    {total_count > 0 && <span className='bg-red-600 px-1.5 py-1 rounded-full ml-1'>{total_count}</span>}
                                </span>
                                <svg
                                    className={`w-3 h-3 transform transition-transform ${isEcommerceOpen ? 'rotate-180' : ''
                                        }`}
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 10 6"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 4 4 4-4"
                                    />
                                </svg>
                            </button>
                            <ul
                                id="dropdown-ecommerce"
                                className={`py-2 space-y-1 ${isEcommerceOpen ? '' : 'hidden'}`}
                            >
                                <li onClick={toggleSidebar}>
                                    <Link
                                        to="/user/message/promotions"
                                        className="flex items-center w-full p-1 transition duration-75 rounded-lg pl-11 hover:bg-[#0E0E0E] hover:font-semibold  bg-transparent text-white"
                                    >
                                        Promotions {+promotion_count > 0 && <span className='bg-red-600 px-1.5 py-1 rounded-full ml-1'>{promotion_count}</span>}
                                    </Link>
                                </li>
                                <li onClick={toggleSidebar}>
                                    <Link
                                        to="/user/message/system"
                                        className="flex items-center w-full p-1  transition duration-75 rounded-lg pl-11 hover:bg-[#0E0E0E] hover:font-semibold  bg-transparent text-white"
                                    >
                                        System messages {+system_count > 0 && <span className='bg-red-600 px-1.5 py-1 rounded-full ml-1'>{system_count}</span>}
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className='px-3'>
                            <Link to="#" className="flex items-center p-2 rounded-lg text-white  group text-base">
                                <span>Finance</span>
                            </Link>
                        </li>

                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/deposits" className="flex items-center p-2 rounded-lg text-white   bg-transparent">
                                <SiderDepositIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Deposit</span>
                            </Link>
                        </li>
                        <li className='px-3 hover:bg-[#0E0E0E] hover:font-semibold' onClick={toggleSidebar}>
                            <Link to="/user/withdrawals" className="flex items-center p-2 rounded-lg text-white   bg-transparent">
                                <SiderWithdrawalIcon className='w-5 h-5' />
                                <span className="ms-3 text-base">Withdraw</span>
                            </Link>
                        </li>

                    </ul>
                </div>
            </aside>
        </>
    )
}

export default SideBar