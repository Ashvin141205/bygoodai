import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';
import { 
    AndroidIcon, 
    BitcoinIcon, 
    LitecoinIcon, 
    DogecoinIcon, 
    CreditCardIcon, 
    FacebookIcon, 
    InstagramIcon, 
    QuoraIcon, 
    RedditIcon, 
    TelegramIcon, 
    TwentyoneIcon, 
    TwitterIcon,
    PaypalIcon,
    CashappIcon 
} from '../../utils/Icons';

const logo = "/bg.png";

const Footer = () => {
    const [isBgLoaded, setIsBgLoaded] = useState(false);
    const divRef = useRef(null);

    const backgroundImageUrl = getImageUrl('/assets/image/footer_main.png');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsBgLoaded(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => {
            if (divRef.current) {
                observer.disconnect();
            }
        };
    }, []);

    return (
        <>
            <div className="relative h-full w-full py-10">
                <div
                    ref={divRef}
                    style={{
                        backgroundImage: isBgLoaded ? `url(${backgroundImageUrl})` : 'none',
                    }}
                    className="absolute inset-0 h-full w-full bg-cover bg-bottom bg-no-repeat opacity-20"
                ></div>
                <div className="relative z-10">
                    <div className="container mx-auto">
                        <div className="flex items-start justify-between flex-wrap gap-10">
                            <div className="w-full md:grid md:grid-cols-5 gap-6 text-white mt-6 sm:grid sm:grid-cols-2">
                                {/* Logo and Description */}
                                <div>
                                    <Link to="/home" className="flex justify-start gap-1">
                                        <img src={logo} className="w-[140px] h-auto object-contain" alt="lucky charm logo" loading="lazy" />
                                    </Link>
                                    <div className="mt-2">
                                        <h3 className="text-lg font-bold text-white">
                                            Play, Win, Withdraw – Instantly! Your winnings, your way!
                                        </h3>
                                        <p className="text-sm text-[#CACACA] mt-2">
                                            We support users in creating accounts, recharging, and withdrawing funds. All platforms are licensed and operate independently. We do not host or operate our own casino games.
                                        </p>
                                        
                                        {/* Company Registration Information - Simple Version */}
                                        <div className="mt-6 pt-4 border-t border-gray-700">
                                            <p className="text-xs text-[#FFDD15] font-bold mb-2">🏢 Registered Company</p>
                                            <p className="text-sm text-white font-semibold">Lucky Charm LLC</p>
                                            <p className="text-xs text-[#CACACA] mt-1">EIN: 14-7C | Established: 2024</p>
                                            <Link to="/company-verification" className="inline-block text-xs text-[#FFDD15] hover:text-white font-semibold mt-2 underline">
                                                Verify Company Registration
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        <Link to="https://www.facebook.com/luckycharmsweep/"><FacebookIcon /></Link>
                                        <Link to="#"><InstagramIcon /></Link>
                                        <Link to="#"><TwitterIcon /></Link>
                                        <Link to="https://t.me/LuckyCharmSweepChannel"><TelegramIcon /></Link>
                                    </div>
                                    <br />
                                    <strong>Phone:</strong><span>+13183741164</span>
                                    <p>Strictly for users aged 21 and above. 
                                    <TwentyoneIcon /></p>
                                </div>

                                {/* Useful Links */}
                                <div>
                                    <h4 className="font-bold mb-3">Useful Links</h4>
                                    <ul className="flex flex-col gap-2">
                                        <li><Link to="/faq">FAQ</Link></li>
                                        <li><Link to="/contact-us">Contact</Link></li>
                                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                                        <li><Link to="/terms-of-service">Terms of Service</Link></li>
                                        <li><Link to="/games">All Games</Link></li>
                                        <li><Link to="/login">Login</Link></li>
                                        <li><Link to="/sign-up">Sign Up</Link></li>
                                    </ul>
                                    <br />
                                </div>

                                {/* Pages */}
                                <div>
                                    <h4 className="font-bold mb-3">Pages</h4>
                                    <ul className="flex flex-col gap-2">
                                        <li><Link to="/">Home</Link></li>
                                        <li><Link to="/about">About</Link></li>
                                        <li><Link to="/blog">Blog</Link></li>
                                        <li><Link to="/deposit">Deposit Now</Link></li>
                                        <li><Link to="/referral/program">Referrals Program</Link></li>
                                        <li><Link to="/slots">Slots</Link></li>
                                        <li><Link to="/deposit-bonus">Deposit Bonus</Link></li>
                                        <li><Link to="/support">Support</Link></li>
                                    </ul>
                                    <br />
                                </div>

                                {/* Gaming Platforms */}
                                <div>
                                    <h4 className="font-bold mb-3">Popular Games</h4>
                                    <ul className="flex flex-col gap-2">
                                        <li><Link to="/games/description/orion-star">Orion Stars</Link></li>
                                        <li><Link to="/games/description/juwa">Juwa</Link></li>
                                        <li><Link to="/games/description/milky-way">Milky Way</Link></li>
                                        <li><Link to="/games/description/game-vault">Game Vault</Link></li>
                                        <li><Link to="/games/description/fire-kirin">Fire Kirin</Link></li>
                                        <li><Link to="/games/description/panda-master">Panda Master</Link></li>
                                        <li><Link to="/games/description/river-sweep">Riversweeps</Link></li>
                                        <li><Link to="/games/description/ultra-panda">Ultra Panda</Link></li>
                                        <li><Link to="/games/description/vegas-x">Vegas X</Link></li>
                                        <li><Link to="/games/description/v-blink">V Blink</Link></li>
                                    </ul>
                                </div>

                                {/* More Games */}
                                <div>
                                    <h4 className="font-bold mb-3">More Games</h4>
                                    <ul className="flex flex-col gap-2">
                                        <li><Link to="/games/description/blue-dragon">Blue Dragon</Link></li>
                                        <li><Link to="/games/description/golden-treasure">Golden Treasure</Link></li>
                                        <li><Link to="/games/description/game-room">Game Room</Link></li>
                                        <li><Link to="/games/description/mafia">Mafia</Link></li>
                                        <li><Link to="/games/description/las-vegas-sweeps">Las Vegas Sweeps</Link></li>
                                        <li><Link to="/games/description/cash-machine">Cash Machine</Link></li>
                                        <li><Link to="/games/description/lucky-star">Lucky Star</Link></li>
                                        <li><Link to="/games/description/moolah">Moolah</Link></li>
                                        <li><Link to="/games/description/e-games">E-Games</Link></li>
                                        <li><Link to="/games/description/cash-frenzy">Cash Frenzy</Link></li>
                                        <li><Link to="/games/description/thunder7">Thunder7</Link></li>
                                        <li><Link to="/games/description/high-stake-sweeps">High Stake Sweeps</Link></li>
                                        <li><Link to="/games/description/juwatwo">Juwa Two</Link></li>
                                        <li><Link to="/games/description/sin-city">Sin City</Link></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Supported Currencies and SSL Info */}
                            <div className="flex flex-col items-center mt-8 text-white">
                                <h4 className="font-bold mb-3">Supported Payment Methods</h4>
                                <div className="flex gap-3">
                                    <BitcoinIcon />
                                    <LitecoinIcon />
                                    <DogecoinIcon />
                                    <CreditCardIcon />
                                      {/* Add PayPal and CashApp Icons here */}
                                      {PaypalIcon && <PaypalIcon />}
                                    {CashappIcon && <CashappIcon />}
                                </div>
                                <p className="text-sm mt-2">SSL Secured Transactions</p>
                                
                                <p className="text-xs mt-2 text-[#CACACA]">
                                    &copy; 2025 Lucky Charm Sweep. All rights reserved. Lucky Charm Sweep supports creating user accounts on licensed platforms. We facilitate deposits and withdrawals for users aged 21 and over.
                                </p>
                                <p className="text-xs mt-2 text-[#CACACA]">
                                    Disclaimer: We do not operate any casino games. All gaming platforms are independently owned and licensed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

         
        </>
    );
};

export default Footer;
