import React from 'react';
import { useNavigate } from 'react-router-dom';

const MW = "/bg.png";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className='py-10' style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
      <div className='container mx-auto px-4'>

      {/* Section 1: Welcome to Lucky Charm Sweep */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <div className='flex flex-col md:flex-row gap-5'>
          <div className='w-full md:w-1/2 flex justify-center items-center'>
            <div className='px-5 py-10 bg-[] rounded-lg'>
              <img src={MW} alt="Lucky Charm Sweep" className='w-full md:w-[300px] object-contain' loading='lazy' decoding='async' />
            </div>
          </div>
          <div className='w-full md:w-1/2 flex flex-col gap-3'>
            <h1 className='uppercase font-bold text-xl sm:text-2xl'>
              Welcome to Lucky Charm Sweep!
            </h1>
            <p className='text-[#CACACA] text-sm sm:text-base'>
              Looking for fun and big wins? Lucky Charm Sweep is your go-to online sweepstakes platform. We bring you top-tier slot games, thrilling gameplay, and fast, hassle-free payouts (processed within 5-30 min)!
            </p>
            <p className='text-[#CACACA] text-sm sm:text-base'>
              Our easy-to-use interface and lightning-fast transactions make every moment count. Why wait when the excitement is just a click away? Join us today!
            </p>
            <button
              className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base mt-3"
              onClick={() => navigate('/sign-up')}
            >
              REGISTER NOW
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Why Choose Lucky Charm Sweep */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-3'>Why Choose Lucky Charm Sweep?</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          Lucky Charm Sweep offers a reliable sweepstakes platform with straightforward gameplay, secure transactions, and transparent policies. Here's what makes us different:
        </p>
        <ul className='list-disc pl-5 mt-3 text-[#CACACA] text-sm sm:text-base'>
          <li>⚡ <strong>Fast & Easy Withdrawals:</strong> Get your winnings instantly, with no delays.</li>
          <li>🔒 <strong>Secure Platform:</strong> We use SSL encryption and secure payment processing to protect your data and transactions.</li>
          <li>🎰 <strong>Massive Game Variety:</strong> Choose from hundreds of games across 26 platforms.</li>
          <li>🤖 <strong>Official Telegram Bot:</strong> Check balance, request withdrawals, track orders, and get alerts — right from Telegram (@LuckyCharmSweepBot).</li>
        </ul>
      </section>

      {/* Section 2.5: Telegram Bot */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-3'>Manage It All in Telegram</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          Prefer chat? Our official Telegram bot makes it effortless to manage your account on the go.
        </p>
        <ul className='list-disc pl-5 mt-3 text-[#CACACA] text-sm sm:text-base'>
          <li>📊 Check wallet balance and active bonuses</li>
          <li>💳 Get deposit links and payment status</li>
          <li>💸 Request withdrawals and track approvals</li>
          <li>🔔 Receive real-time notifications</li>
          <li>🛟 Open a support ticket 24/7</li>
        </ul>
        <div className='mt-4'>
          <a
            href='https://t.me/LuckyCharmSweepBot'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base'
          >
            Open Telegram Bot
          </a>
          <p className='text-[#9CA3AF] text-xs mt-2'>Requires Telegram. Available 24/7.</p>
        </div>
      </section>

      {/* Section 3: Our Game Platforms */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Our Game Platforms</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          At Lucky Charm Sweep, we’ve partnered with the best game providers to bring you a one-of-a-kind experience. Here’s a taste of the platforms we support:
        </p>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-[#CACACA] text-sm sm:text-base'>
          <p>Milky Way</p>
          <p>Fire Kirin</p>
          <p>Juwa</p>
          <p>Game Vault</p>
          <p>Orion Star</p>
          <p>River Sweep</p>
          <p>Blue Dragon</p>
          <p>Golden Treasure</p>
          <p>Para Casino</p>
          <p>Game Room</p>
          <p>Mafia</p>
          <p>Vegas Sweep</p>
          <p>Cash Machine</p>
          <p>V-blink</p>
          <p>Ultra Panda</p>
          <p>Panda Master</p>
          <p>Lucky Star</p>
          <p>Moolah</p>
          <p>E-Games</p>
          <p>Cash Frenzy</p>
          <p>Joker</p>
        </div>
      </section>

      {/* Section 4: Our Commitment to Fair Play */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Our Commitment to Fair Play</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          We partner with licensed game providers who use certified random number generators (RNG) to ensure fair gameplay. All games operate independently with predetermined odds, giving every player an equal opportunity to win.
        </p>
      </section>

      {/* Section 5: 24/7 Customer Support */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-3'>24/7 Customer Support</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          Our support team is available around the clock to assist with deposits, withdrawals, account verification, and technical issues. Contact us via email (info@luckycharmsweep.com), phone (+1 318-374-1164), or our contact form.
        </p>
        <button
          className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base mt-3"
          onClick={() => navigate('/support')}
        >
          CONTACT SUPPORT
        </button>
      </section>

      {/* Section 6: Getting Started is Easy */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Getting Started is Easy!</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          Want to join the fun? Here’s how:
        </p>
        <ol className='list-decimal pl-5 mt-3 text-[#CACACA] text-sm sm:text-base'>
          <li>Create your free account.</li>
          <li>Deposit funds using cash or crypto.</li>
          <li>Start playing and winning instantly!</li>
        </ol>
        <button
          className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base mt-4"
          onClick={() => navigate('/sign-up')}
        >
          SIGN UP NOW
        </button>
      </section>

      {/* Section 7: Unmatched Security & Reliability */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Security & Reliability</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          We implement industry-standard security measures including SSL/TLS encryption for all transactions, secure payment gateway integration, and regular security audits. Your account information and payment details are stored using encrypted protocols.
        </p>
      </section>

      {/* Section 8: Play, Win, Withdraw - It’s That Simple */}
      <section className='bg-[#290A47] p-6 border-b-[3px] border-[#EC29FC] rounded-lg text-white mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Ready to Get Started?</h2>
        <p className='text-[#CACACA] text-sm sm:text-base'>
          Create your account, make a deposit starting from $10, and begin playing across 26 different gaming platforms. Withdrawals have a $20 minimum and are processed fast: 5–30 minutes for non-crypto methods, and 30 minutes–24 hours for crypto (network dependent).
        </p>
        <button
          className="bg-[#FFDD15] text-black font-bold py-2 px-4 rounded text-sm sm:text-base mt-3"
          onClick={() => navigate('/deposit')}
        >
          START NOW
        </button>
      </section>
    </div>
    </div>
  );
};

export default About;
