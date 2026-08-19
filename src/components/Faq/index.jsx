import { useState, useEffect } from "react";
import FAQItem from "./FaqItem";
import FAQUl from "./FaqUl";
import MultipleFaq from "./MultipleFaq";

const FaqContent = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [userIssue, setUserIssue] = useState(""); // State for user's issue
  const [suggestedFaq, setSuggestedFaq] = useState(null); // State for suggested FAQ

  const toggleFAQItem = (index) => {
    setOpenIndex(openIndex === index? null: index);
  };
  const faqCategories = [
    {id:"general",label: "General FAQ's"},
    { id: "bonuses", label: "Bonuses and Promotions" },
    { id: "deposits", label: "Deposits" },
    { id: "withdrawals", label: "Withdrawals" },
    { id: "account", label: "Account Creation and Login" },
    { id: "redemption_rules", label: "Redemption Rules" }, // Added category
    { id: "referral", label: "Referral Program" }, // Added category


  ];

  const faqs = [
    {
      question: "What is Lucky Charm Sweep?",
      answer: `Lucky Charm Sweep is an online sweepstakes platform that provides the latest online slot games and slots from the comfort of your home. We give you zero financial risks and 100% privacy due to the crypto solutions we offer. There are more than 3000+ unique games from 26 different platforms for you to enjoy with your friends and colleagues. You're guaranteed to have the best time ever!`,
      category: "general",
    },
    {
      question: "How many platforms are available on Lucky Charm Sweep?",
      answer:
        "We currently offer 26 gaming platforms with over 3000+ unique games. Popular platforms include:",
      liData: [
        "Milky Way",
        "Fire Kirin",
        "Juwa",
        "Game Vault",
        "Orion Stars",
        "River Sweep",
        "Blue Dragon",
        "Golden Treasure",
        "Paradise Casino",
        "Game Room",
        "Ultra Panda",
        "Panda Master",
        "Lucky Star",
        "E-Games",
        "Vegas Sweeps",
        "V-blink",
        "Cash Machine",
        "Moolah",
        "Cash Frenzy",
        "Joker",
        "Mafia",
        "And 5 more platforms",
      ],
      category: "platforms",
    },
    {
      question: "How do you register on Lucky Charm Sweep?",
      answer: `To register on Lucky Charm Sweep, Click on the “Sign up" button on the Lucky Charm Sweep official website. You'll be redirected to the registration pages, where you have to fill in all the necessary details. After the registration, your account will be pending while we approve your request. When your account gets approved, you’ll get a confirmation email with all the necessary details. You can also request to play on other platforms by clicking on your profile's “Platforms” tab.`,
      category: "account",
    },
    {
      question: "How do I deposit on Lucky Charm Sweep?",
      answer: `In order to deposit, click on Deposit on the navigation bar. Deposit the amount you want to add and add it to the cart. Proceed to the checkout and select your preferred platform. Review the order and pay with either Bitcoin, Litecoin or Dogecoin. You can scan the QR code with your Bitcoin, Litecoin Dogecoin, cashapp, paypal wallet and credit card in the payment section or just send the amount to the shown BTC/DOGE address.`,
      category: "deposits",
    },
    {
      question: "What is a weekly bonus, and how is it calculated?",
      answer: `The weekly bonus is a chance for you to get a bonus every day of the week. But you can only use it once a day. Daily bonuses and User Role bonuses are included in your balance with the weekly bonuses, except coupon codes.`,
      category: "bonuses",
    },
    {
      question:
        "How long does it take for the deposit to be credited to my game account?",
      answer: `The speed of the Bitcoin transfers is mostly dependent on the transaction speed/fee the sender chooses. If the sender is selecting to do the instant transaction or the transaction with the higher fee, it usually takes a short time to be completed. In general, it takes 0-3 hours for most of the transactions to be completed. We are processing the transactions within 30 minutes after we receive them. Whenever we receive the payment, you will receive an email that we have started to process your order. Please be informed that it is a normal procedure, and we ask for your patience during this process.`,
      category: "deposits",
    },
    {
      question: "How do I withdraw (redeem) from Lucky Charm Sweep?",
      answer: `In order to withdraw from Lucky Charm Sweep, sign in to your account and click on "Withdrawal." On that page, you'll have to fill out a form that specifies the platform and the amount you want to withdraw. The minimum withdrawal amount is $20. Available withdrawal methods include Litecoin, Dogecoin, PayPal (5% fee), Cash App (7% fee), USDT (Tether with $1 fee), and your Main Wallet (no fee). Make sure that you have provided your payment information before you complete other steps.`,
      category: "withdrawals",
    },
    {
      question: "How long does it take to complete the withdrawal process?",
      answer: `Processing time varies by payment method: PayPal and Cash App typically take 10-30 minutes, while cryptocurrency withdrawals can take 30 minutes to 24 hours due to blockchain network traffic. All withdrawals include account verification and balance confirmation.`,
      category: "withdrawals",
    },
    {
      question: "What is the minimum withdrawal amount?",
      answer: `The minimum withdrawal amount is $20. This applies to all withdrawal methods including PayPal, Cash App, cryptocurrency, and Main Wallet transfers.`,
      category: "withdrawals",
    },
    {
      question: "What fees are charged for withdrawals?",
      answer: `Withdrawal fees vary by payment method: Main Wallet (0% - Free), PayPal (5% fee), Cash App (7% fee), USDT/Tether ($1 flat fee), and cryptocurrency options (Litecoin, Dogecoin - network fees apply). Choose the method that works best for you.`,
      category: "withdrawals",
    },
    {
      question: "What are the withdrawal limitations?",
      answer: "Your daily withdrawal limit depends on your total deposit history. Limits increase as you deposit more, ensuring fair and secure withdrawals for all users.",
      liData: [
        "No deposits yet: Up to $100/day",
        "Under $4,000 total deposits: Up to $200/day",
        "$4,000 - $7,999 deposits: Up to $300/day",
        "$8,000 - $15,999 deposits: Up to $400/day",
        "$16,000 - $31,999 deposits: Up to $500/day",
        "$32,000 - $63,999 deposits: Up to $600/day",
        "$64,000 - $127,999 deposits: Up to $700/day",
        "$128,000 - $255,999 deposits: Up to $1,000/day",
        "$256,000 - $499,999 deposits: Up to $1,500/day",
        "$500,000 - $999,999 deposits: Up to $2,000/day",
        "$1,000,000+ total deposits: Unlimited",
      ],
      category: "withdrawals",
    },
    {
      question: "What are the withdrawal policies?",
      answer: "",
      category: "withdrawals",
    },
    {
      question: "What happens if a player cheats?",
      answer: `If a user is found to be committing fraud and has made a deposit, they’ll be suspended from the site for one week. If the person hasn’t made any deposits, the suspension will continue for three months. We caution any player to stay away from fraudulent acts.`,
      category: "general",
    },
    {
      question:
        "What will happen if I don’t enter my gaming account for a certain period?",
      answer: `In that case, your account will be deactivated by Lucky Charm Sweep if the inactivity lasts longer than 60 days.`,
      category: "account",
    },
    {
      question: "What are the details of the requirement?",
      answer: `For account security reasons, we may ask you to upload a selfie along with a piece of paper with the date you took the picture and the name of the platform.`,
      category: "account",
    },
    {
      question: "Why is this selfie necessary?",
      answer: `It's one of the many security measures we use to verify that we're talking to the actual account holder and not an imposter. We know how inconvenient this is. But it's essential to provide you with the best possible account security. That's why we require such information.`,
      category: "account",
    },
    {
      question: "What is the best way to take this selfie without rejection?",
      answer: `First, you, the Lucky Charm Sweep account holder, must take the selfie with a piece of paper that includes the date you took the picture. Any other person will be rejected. Second, the platform’s name and date should be handwritten to avoid computer-edited requests.`,
      category: "account",
    },
    {
      question: "How should I send the file?",
      answer: `You can send the file via email. However, we strongly advise you to check the email you received to send the images.`,
      category: "account",
    },
    {
      question: "Can I withdraw my sign up bonus?",
      answer: `In order to be able to make a withdrawal request you need to meet the bonus playthrough requirements or make a deposit and generate winnings. Bonus funds cannot be withdrawn directly without being played through.`,
      category: "withdrawals",
    },
    {
      question: "What is a BTC address?",
      answer: `A BTC wallet address is similar to a bank account number. It's a unique 26-35 digit combination of letters and numbers, and it looks something like this: 1ExAmpLe0FaBiTco1NADr3sSV5tsGaMF6hd.`,
      category: "deposits",
    },
    {
      question: "How to play Lucky Charm Sweep games?",
      answer: `In order to play games, first, you need to register on the website. After registering, when we approve your account, you’ll get a confirmation email with all the necessary details. You can also request to play on other platforms by clicking on your profile's “Platforms” tab.`,
      category: "general",
    },
    {
      question: "How can I refer to my friend?",
      answer: `Go to your profile tab and copy your unique referral code. Share it with friends. When your friend signs up using your referral code and makes their first deposit of at least $10, you both receive a $10 bonus. There's no limit to how many friends you can refer!`,
      category: "general",
    },
    {
      question: "How do I buy, send, or receive Bitcoin using Cash App?",
      answer: `You have to download the Cash App. In the app, tap on the rising curve icon. Two available options, Bitcoin and Buy Stocks will be shown. Select Bitcoin, tap the buy button, and specify the amount you want to purchase. Click next. A confirmation screen will appear where you’ll see full details of the transaction. Complete the transaction by clicking on the confirm button.`,
      answer2: `To receive Bitcoin, go to the Banking tab on the main screen, select Bitcoin, and tap the deposit BTC. You can scan, copy, or share your Cashapp Bitcoin address with Lucky Charm Sweep or an external wallet. If you want to send Bitcoin, select the Banking tab and select BTC. You can scan the QR code to send the BTC.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive Bitcoin using Coinbase?",
      answer: `You can easily make all the mentioned transactions through Coinbase. See our detailed guide: `,
      link: "https://luckycharmsweep.com/coinbase/",
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive Bitcoin using Kraken?",
      answer: `You can easily make all the mentioned transactions through Kraken. See our detailed guide: `,
      link: "https://luckycharmsweep.com/kraken/",
      category: "deposits",
    },
    {
      question: "What is the Lucky Charm Sweep Referral Program?",
      answer: `The referral program allows you to invite your friends to Lucky Charm Sweep and earn rewards. For every friend that joins using your referral code and makes a deposit, you’ll receive $5 plus 10% of all their deposit bonuses—forever! There’s no limit to how many friends you can refer.`,
      category: "referral",
    },
    {
      question: "How do I get my referral code?",
      answer: `After logging into your Lucky Charm Sweep account, go to the “Referrals” tab on your profile. There, you’ll find your unique referral code. Simply copy the code and share it with your friends.`,
      category: "referral",
    },
    {
      question: "Where does my referral bonus go?",
      answer: `Your referral bonuses are credited directly to your Bonus Wallet. You can track your bonus balance anytime from your account dashboard.`,
      category: "referral",
    },
    {
      question: "How can I withdraw my referral bonuses?",
      answer: `You can withdraw your referral bonuses through multiple options such as PayPal, CashApp, Chime, or crypto. Just ensure your account is verified and follow the standard withdrawal process from the Bonus Wallet.`,
      category: "referral",
    },
    {
      question: "Is there a limit to how many people I can refer?",
      answer: `No, there’s absolutely no limit! You can refer as many friends as you like and earn from each one who deposits. The more friends you invite, the more you earn.`,
      category: "referral",
    },
    
    {
      question: "How do I buy, send, or receive Bitcoin using Binance?",
      answer: `You can easily make all the mentioned transactions through Binance. See our detailed guide:`,
      link: "https://luckycharmsweep.com/binance/",
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive DOGE coin using Coinbase?",
      answer: `Download Coinbase for your iPhone/Android device or use the desktop version. Set up an account, sign in and click “Trade”. Then Select DOGE in the “Buy” section, enter DOGE amount, choose payment method, and add your card details. Confirm the transaction after reviewing it.`,
      answer2: `To send DOGE, click the “Send” button, select DOGE, enter the DOGE amount, and paste the receiver’s wallet address. As for receiving DOGE, you will need to click “Receive,” select DOGE, and share your DOGE address with the sender.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive DOGE coin using Kraken?",
      answer: `Register on Kraken and top up the account balance. Then go to "Funding," click "Buy Crypto," select DOGE and, enter the amount, press “Continue,” verify your account (if you are purchasing for the first time), and complete the transaction.`,
      answer2: `To send DOGE, go to "Funding" again, select DOGE, and click "Withdraw", add the receiver's address, enter the DOGE amount, and submit the transaction. As for receiving, go to "Funding," click "Deposit," generate a new address (if you don't have it yet), and share it with the sender.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive DOGE coin using Binance?",
      answer: `Register on Binance, click "Buy Crypto," and use Credit/Debit card payment. Select DOGE and enter the amount. Proceed with the transaction by verifying your account and then completing the order by entering card details and confirming the purchase.`,
      answer2: `To send DOGE, hover over "Wallet" and then click "Overview". Press “Withdraw,” select DOGE, paste the wallet address, enter the amount, and confirm the transaction. To receive DOGE, go to "Deposit," click DOGE, select transaction network, copy the address, and share it.`,
      category: "deposits",
    },
    {
      question: "Can I combine my main and bonus balances to make a purchase?",
      answer: `No, you cannot combine your main and bonus balances. To make a purchase, you must have at least $10 in either your main wallet or your bonus wallet. For example, having $1 in your main balance and $9 in your bonus balance does not qualify. One of the wallets must have the full $10 amount required for the transaction.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive Ether coin using Coinbase?",
      answer: `Download Coinbase, go to “Trade,” select Ether (under the “Buy” section), enter the Ether amount, and choose the payment method. After entering the payment details, confirm the transaction.`,
      answer2: `To send Ether, click "Send," select Ether, and indicate the amount. Then paste receiver's address and submit the transaction. To receive Ether, go to "Receive," select Ether, and copy your Ether address.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive Ether coin using Kraken?",
      answer: `Register on Kraken, top up the account, and then go to "Funding." Click "Buy Crypto," choose Ether, enter the fiat amount, proceed by verifying your account, and complete the transaction.`,
      answer2: `To send Ether, go to "Funding", select Ether, click "Withdraw", paste the receiver's wallet address, then indicate the amount and complete the transaction. To receive Ether, go to "Funding" again and now click "Deposit," generate a new address if you need it, and share it.`,
      category: "deposits",
    },
    {
      question: "How do I buy, send, or receive Ether coin using Binance?",
      answer: `Go to Binance, click "Buy Crypto" by card (if you want to use a Credit/Debit Card). Then, choose Ether, enter its amount, and proceed with verifying your account. Finally, complete the order by providing card details and confirming the transaction.`,
      answer2: `To send Ether, go to "Overview" by hovering over "Wallet". Then press "Withdraw," select Ether, paste the wallet address where you want to send your Ether, and indicate the amount. To receive Ether, go to the "Deposit" page, select Ether and transaction network, and copy the address to then share it.`,
      category: "deposits",
    },
    {
      question: "What is Dogecoin?",
      answer: `Dogecoin is a cryptocurrency that is widely used all over the world. Dogecoin was invented in 2013. It is famous for its Shiba Inu dog logo. `,
      category: "general",
    },
    {
      question: "Can I use Dogecoin to make transactions on Lucky Charm Sweep?",
      answer: `Yes, Lucky Charm Sweep allows for Dogecoin transactions. You can use Dogecoin both for withdrawals and deposits. `,
      category: "deposits",
    },
    {
      question: "Is it safe to use Dogecoin on Lucky Charm Sweep?",
      answer: `Dogecoin is a safe cryptocurrency. The Dogecoin transactions are made with blockchain technology that ensures maximum security. Plus, Lucky Charm Sweep employs cutting-edge security software that provides additional safety for transactions.&nbsp;`,
      category: "general",
    },
    {
      question: "What are the advantages of Dogecoin?",
      answer: `In addition to fast payments and absolute anonymity, Dogecoin offers low transaction fees. It is a massive advantage over other cryptocurrencies that have been experiencing a rise in transaction costs lately. `,
      category: "general",
    },
    {
      question: "Is Dogecoin widely accepted?",
      answer: `Yes, Dogecoin is a widely accepted cryptocurrency. It is used for many purposes, including shopping, entertainment, tipping, etc. Due to high demand, almost all platforms accepting crypto transactions support Dogecoin payments. `,
      category: "general",
    },
    {
      question: "Can I exchange Dogecoin for real money?",
      answer: `Yes, you can exchange Dogecoin for real money with the help of a crypto exchange platform or a crypto wallet. `,
      category: "general",
    },
    {
      question: "How can I purchase Dogecoin?",
      answer: `Dogecoin can be purchased on almost all crypto exchanges or wallets. For instance, you can try out Edge Wallet, a user-friendly app for making crypto transactions. `,
      category: "deposits",
    },
    {
      question: "How can I create an Edge Wallet?",
      answer: `To set up an Edge Wallet, you should first download the app either for Android  or iOS  phones. After installing the application, proceed with registering an account. Once you set up the account, you will be able to generate personal crypto addresses for various cryptocurrencies, including Ethereum, Bitcoin, and Dogecoin. `,
      category: "deposits",
    },
    {
      question: 'How can I create an Edge Wallet?',
      answer: `To set up an Edge Wallet, you should first download the app either for Android  or iOS  phones. After installing the application, proceed with registering an account. Once you set up the account, you will be able to generate personal crypto addresses for various cryptocurrencies, including Ethereum, Bitcoin, and Dogecoin. `,
      category: 'deposits', // Or 'general' if it's not specific to deposits
    },
    {
      question: 'Is Edge Wallet safe?',
      answer: `Yes, Edge is a safe crypto wallet. Edge Wallet enjoys high trust rates among customers and has positive feedback and reviews from crypto experts. `,
      category: 'general'},
      {
        question: 'How can I deposit Dogecoin to Lucky Charm Sweep?',
        answer: `To deposit Dogecoin to Lucky Charm Sweep, you will need a crypto wallet like Edge or a crypto exchange account.`,
        answer2: `First, go to the Lucky Charm Sweep deposits page and select your preferred platform. Then, proceed with checkout and enter the amount you want to transfer. Pick Dogecoin and copy the generated crypto address. `,
        answer3: `After this, you can go to your crypto wallet and use the mentioned crypto address to transfer Dogecoins to your Lucky Charm Sweep account. `,
        category: 'deposits'
      },
      {
        question: 'How can I withdraw Dogecoin from Lucky Charm Sweep?',
        answer: `To withdraw Dogecoin from Lucky Charm Sweep, you will need a crypto wallet or a crypto exchange account. `,
        answer2: `First, go to your crypto wallet account and copy your Dogecoin crypto address. Then come back to Lucky Charm Sweep and click withdrawals. Enter the amount of Dogecoin you want to withdraw, then paste your crypto wallet address into a relevant bar. Finally, review the transaction and confirm it. `,
        category: 'withdrawals'
      },
      {
        question: 'Does Lucky Charm Sweep charge fees for Dogecoin transactions?',
        answer: `No, Lucky Charm Sweep doesn’t charge any fees for Dogecoin transactions. That said, you need to remember that crypto transactions come with network fees. `,
        category: 'deposits' // Or 'withdrawals' if more appropriate
      },
      {
        question: 'I won using the daily bonus. Can I withdraw these winnings immediately?',
        answer: `Bonus credits are designed to enhance your gaming experience. To withdraw winnings earned from bonus credits, you must first make a deposit and generate additional winnings. Bonus-only winnings have a 25% withdrawal rate, while deposit-based winnings can be withdrawn at 100%. For the best results, we recommend making a deposit to unlock full withdrawal potential.`,
        category: 'withdrawals'
      },
      {
        question: 'How can I update my account information?',
        answer: `To update your account information, log in to your Lucky Charm Sweep account, go to the “Profile” tab, and select “Edit Profile.” Make the necessary changes and click “Save” to update your details.`,
        category: 'account'
      },
      {
        question: 'Can I have multiple accounts on Lucky Charm Sweep?',
        answer: `No, users are allowed to have only one account. Having multiple accounts may lead to account suspension or banning due to violation of our terms and conditions.`,
        category: 'account'
      },
      {
        question: 'What should I do if I forgot my password?',
        answer: `Click on the “Forgot Password” link on the login page and enter your registered email address. We’ll send you an email with instructions on how to reset your password.`,
        category: 'account'
      },
      {
        question: 'Are my personal details safe with Lucky Charm Sweep?',
        answer: `Absolutely. We use advanced encryption technology to ensure your personal information is secure and never shared with third parties. Your safety is our priority.`,
        category: 'general'
      },
      {
        question: 'What devices can I use to access Lucky Charm Sweep?',
        answer: `You can access Lucky Charm Sweep on various devices, including desktop computers, laptops, tablets, and smartphones. Our platform is optimized for both iOS and Android operating systems.`,
        category: 'general'
      },
      {
        question: 'Can I pause my account temporarily?',
        answer: `Yes, if you wish to take a break, you can temporarily deactivate your account by going to your profile settings. When you’re ready to return, you can reactivate your account without losing any of your progress or funds.`,
        category: 'account'
      },
      {
        question: 'How can I set deposit limits for responsible gaming?',
        answer: `We support responsible gaming. To set deposit limits, go to the “Settings” tab in your profile and click on “Responsible Gaming.” Here, you can customize your daily, weekly, or monthly deposit limits.`,
        category: 'deposits' // Or 'general' if more appropriate
      },
      {
        question: 'What are in-game tokens, and how do they work?',
        answer: `In-game tokens are virtual credits that can be used to play games on our platform. They cannot be withdrawn as real money but can enhance your gaming experience by unlocking special features and bonuses.`,
        category: 'general' // Or 'bonuses' if more appropriate
      },
      {
        question: 'Can I cancel a withdrawal request?',
        answer: `Yes, you can cancel a withdrawal request as long as it has not been processed yet. To cancel, go to the “Withdrawals” section in your profile and select the request you want to cancel.`,
        category: 'withdrawals'
      },
      {
        question: 'What should I do if I notice unauthorized activity on my account?',
        answer: `If you suspect unauthorized activity, please contact our support team immediately. We’ll take prompt action to secure your account and investigate the issue.`,
        category: 'account'
      },
      {
        question: 'How can I close my account permanently?',
        answer: `If you wish to close your account permanently, please contact our support team. They will guide you through the process and ensure your data is handled securely.`,
        category: 'account'
      },
      {
        question: 'Do I need to verify my account before making withdrawals?',
        answer: `Yes, account verification is necessary to ensure the security of all transactions. You will be asked to provide documents, such as a government-issued ID and proof of address, before making your first withdrawal.`,
        category: 'withdrawals' // Or 'account' if more appropriate
      },

      {
        question: 'Should I verify my account on a daily basis?',
        answer: `When you sign up at Lucky Charm Sweep, you are asked to verify your account. Depending on how much you deposit at the platform over a year span, you will complete the verification process a few times.`,
        category: 'account'
      },
      {
        question: 'What are the details regarding verification and the impact of the deposit amount on them?',
        answer: `Players who initially deposited less than $500 need to verify their Luck Charm Sweep accounts every month. If they deposited more than $500 up to $5.000, they only need to verify their gaming account twice a year. Moreover, users who deposit more than $5.000 up to $50.000 only need to verify the account once a year.`,
        category: 'account'
      },
      {
        question: 'In which case can I avoid verification?',
        answer: `You can avoid the verification process as a whole once your deposit amount exceeds $50.000. The other option for players to avoid verification is by withdrawing 4 times less than what they actually deposited. So, if your total withdrawal amount is 4 times less than your total deposits at the platform, you do not have to complete the verification process at Luck Charm Sweep.`,
        category: 'account'
      },
      {
        question: 'Are withdrawal terms also applicable for winnings through a signup bonus?',
        answer: `Yes, you still need to get verified to withdraw the amount. However, if you accumulated rewards by just using the signup bonus and without actually depositing, you will have a daily withdrawal limit of $100.`,
        category: 'withdrawals'
      },
      {
        question: 'Which Steps do I need to take to get verified on Luck Charm Sweep?',
        answer: `To get verified on Luck Charm Sweep, all you need to do is to submit a selfie while holding your ID card. This is applicable to users who deposited, won, and tried to withdraw the amount. On the other hand, for users who did not make a deposit and won through using the sign-up bonus, the verification steps are a little bit different.`,
        category: 'account'
      },
      {
        question: 'How do I get verified if I am trying to withdraw the amount that I earned through the signup bonus without making a deposit?',
        answer: `To start the process, you need to provide a selfie with your ID Card while holding a paper on which the date of the verification and the website that you are trying to get verified is written. Make sure that the image is clear and the scripts on the paper are visible. Otherwise, it can delay the verification process. To finalize, submit the documents and check your email afterward to get updates.`,
        category: 'account'
      },
      {
        question: "I'm having trouble creating an account. What should I do?",
        answer:
          "Make sure you're providing accurate information and that you meet the account creation requirements (e.g., age, location). If you're still having trouble, contact our support team for assistance.",
        category: "account",
      },
      {
        question: "I can't remember the email I used to sign up. How can I recover my account?",
        answer:
          "You can try contacting our support team and providing any relevant information you remember about your account (username, phone number, etc.). They may be able to help you recover your account.",
        category: "account",
      },
      {
        question: "I received an error message when trying to sign up. What does it mean?",
        answer:
          "The error message should provide some information about why the signup failed. Common reasons include incorrect information, an existing account with the same email, or technical issues. If you're unsure, contact our support team.",
        category: "account",
      },
      {
        question: "How long does it take for my deposit to appear in my account?",
        answer:
          "Deposits usually take a short time to process, but it can sometimes take up to a few hours depending on the payment method and network traffic. If your deposit hasn't appeared after a reasonable time, contact our support team.",
        category: "deposits",
      },
      {
        question: "I deposited money, but it's not showing up in my account. What should I do?",
        answer:
          "First, double-check your transaction details to ensure everything is correct. If the information is accurate and the deposit still hasn't appeared after a reasonable time, contact our support team and provide them with your transaction details.",
        category: "deposits",
      },
      {
        question: "How do I withdraw my winnings?",
        answer:
          "To withdraw your winnings, go to the 'Withdrawal' section of your account, fill out the withdrawal form, and select your preferred withdrawal method. Make sure you meet the withdrawal requirements (e.g., minimum withdrawal amount, account verification).",
        category: "withdrawals",
      },
      {
        question: "How do I claim the sign-up bonus?",
        answer:
          "The sign-up bonus is usually automatically credited to your account after you complete the registration process. If you haven't received the bonus, check the promotion terms or contact our support team.",
        category: "bonuses",
      },
      {
        question: "I shared on social media, but I didn't get my bonus. What should I do?",
        answer:
          "Make sure you followed the instructions for claiming the social media bonus correctly. If you believe you've met the requirements and still haven't received the bonus, contact our support team and provide them with any relevant information (e.g., social media links).",
        category: "bonuses",
      },
      {
        question: "How can I contact customer support?",
        answer:
          "You can contact our customer support team by email or through the live chat feature on our website. Our support team is available 24/7 to assist you with any questions or issues.",
        category: "general",
      },
      {
        question: "What are the system requirements for playing games on Lucky Charm Sweep?",
        answer:
          "You'll need a device with a stable internet connection and a web browser that supports HTML5 and JavaScript. Most modern computers, laptops, tablets, and smartphones should meet these requirements.",
        category: "general",
      },
      {
        question: "What if I encounter a technical issue while playing a game?",
        answer:
          "If you experience any technical problems, please contact our support team. They can help you troubleshoot the issue and get back to playing.",
        category: "general",
      },
      {
        question: "Can I play games for free on Lucky Charm Sweep?",
        answer:
          "Yes, you can use your bonus balance, earned through promotions and rewards, to play games without making a deposit. However, keep in mind that winnings from bonus balance play might have different withdrawal conditions.",
        category: "general",
      },
      {
        question: "How do I know if a game is fair?",
        answer:
          "All our game providers are licensed and operate independently. We ensure that all games on our platform are fair and use random number generators (RNGs) to determine the outcomes.",
        category: "general",
      },
      {
        question: "What is your responsible gaming policy?",
        answer:
          "We are committed to promoting responsible gaming. You can set deposit limits and find resources and information about responsible gaming on our website.",
        category: "general",
      },
      {
        question: "How do I report a bug or issue with the website?",
        answer:
          "If you encounter any bugs or issues with our website, please report them to our support team so we can investigate and resolve them promptly.",
        category: "general",
      },
      {
        question: "How do I unsubscribe from promotional emails?",
        answer:
          "You can unsubscribe from promotional emails by clicking the 'Unsubscribe' link at the bottom of any promotional email you receive from us.",
        category: "general",
      },
      {
        question: "What are the terms and conditions of using Lucky Charm Sweep?",
        answer:
          "You can find our detailed terms and conditions on our website. Please review them carefully before using our platform.",
        category: "general",
      },
      {
        question: "The username and password for my game account aren't working. What should I do?",
        answer:
          "First, double-check that you've typed the username and password correctly, paying attention to capital letters. If you're sure the information is correct, it might be a technical issue with the platform or a human error on our part. You can request a password reset in the game account section or contact support for faster resolution.",
        category: "account",
      },
      {
        question: "I haven't received the credits I deposited into my platform account. What should I do?",
        answer:
          "There might be a delay in crediting the amount, or our team might have accidentally missed adding it. Please wait at least an hour, and if the credits still haven't appeared, contact our support team.",
        category: "deposits",
      },
      {
        question: "The platform link isn't working. What's wrong?",
        answer:
          "We only provide services for deposits, withdrawals, and account creation. We don't operate the games or platforms themselves. If a platform link isn't working, it might be due to a technical issue on their end. You'll have to wait until they resolve the issue and the platform becomes operational again.",
        category: "general",
      },
      {
        question: "Why was my deposit/freeplay request rejected?",
        answer:
          "Sometimes, we need to reject deposit or freeplay requests due to technical issues with a particular platform or other unforeseen circumstances. If your request is rejected, you'll receive an email with the reason and the option to get a refund or choose another available platform.",
        category: "deposits",
      },
      {
        question: "Will I be notified about updates to my account or requests?",
        answer:
          "Yes, we will keep you informed about every action taken on your account, including deposit/withdrawal approvals, rejections, and other updates. You'll receive email notifications for all important actions.",
        category: "general",
      },
      {
        question: "I saw a different bonus offer in an ad. Which one is correct?",
        answer:
          "We sometimes run different campaigns with varying offers through third-party advertising platforms. Occasionally, older graphics or expired offers might still be displayed due to delays in updating those campaigns. We apologize for any misrepresentation and always strive to keep our promotions up-to-date. If you're unsure about a specific offer, please contact our support team for clarification.",
        category: "bonuses",
      },
      {
        question: "How do Freeplay Redemptions work?",
        answer: `Free plays are earned through campaigns and can be used for deposits, but cannot be withdrawn directly. You can withdraw 30% of your winnings when you play with your Freeplay Balance.`,
        liData: [
          "Free plays are earned through campaigns.",
          "Free plays can be used for deposits.",
          "Free plays cannot be withdrawn directly.",
          "You can withdraw 30% of your winnings when you play with your Freeplay Balance.",
        ],
        category: "redemption_rules",
      },
      {
        question: "How are winnings calculated when using Bonus and Deposit Funds?",
        answer: `Withdrawable amounts are calculated based on the proportion of bonus and deposit funds used.`,
        liData: [
          "Withdrawable amounts are calculated based on the proportion of bonus and deposit funds used.",
          "Bonus funds have a 25% withdrawable percentage.",
          "Deposit funds have a 100% withdrawable percentage.",
        ],
        category: "redemption_rules",
      },
      {
        question: "Can you provide an example of a Deposit Only redemption scenario?",
        answer: "If you won $100 and only used deposit funds, you can withdraw $100 (100%).",
        category: "redemption_rules",
      },
      {
        question: "Can you provide an example of a Bonus Only redemption scenario?",
        answer: "If you won $100 and only used bonus funds, you can withdraw $25 (25%).",
        category: "redemption_rules",
      },
      {
        question: "Can you provide an example of a Freeplay Only redemption scenario?",
        answer: "If you won $100 and only used freeplay funds, you can withdraw $30 (30%).",
        category: "redemption_rules",
      },
      {
        question: "Can you provide an example of a Bonus and Deposit Funds redemption scenario?",
        answer: "If you won $100 and used $60 deposit and $40 bonus, you can withdraw $60 (100% of deposit winnings) + $10 (25% of bonus winnings) = $70.",
        category: "redemption_rules",
      },
      {
        question: "Can you provide an example of a Freeplay and Bonus Funds redemption scenario?",
        answer: "If you won $100 and used $50 freeplay and $50 bonus, you can withdraw $25 (25% of bonus winnings) + $15 (30% of freeplay winnings) = $40.",
        category: "redemption_rules",
      },
      {
        question: "What is the Winner Bonus and how does it work?",
        answer: "After your withdrawal is approved and paid, you become eligible for a special Winner Bonus! For the next 48 hours, your next deposit will receive an additional +25% bonus on top of your regular deposit bonus. This is our way of rewarding winning players. The Winner Bonus expires 48 hours after your withdrawal is completed.",
        category: "bonuses",
      },
      {
        question: "How do I know if I have an active Winner Bonus?",
        answer: "Your Winner Bonus status will be displayed in your account dashboard after a successful withdrawal. You'll see the expiry timer counting down the 48-hour window. Make your next deposit before it expires to claim your +25% Winner Bonus!",
        category: "bonuses",
      },
    //... other FAQs (up to index 56)
  ];

  const findRelevantFaq = (issue) => {
    const issueWords = issue.toLowerCase().split(" ");
    let bestMatch = null;
    let bestMatchScore = 0;

    for (const faq of faqs) {
      let score = 0;
      const faqText = `${faq.question.toLowerCase()} ${faq.answer.toLowerCase()}`;
      for (const word of issueWords) {
        if (faqText.includes(word)) {
          score++;
        }
      }
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = faq;
      }
    }

    return bestMatch;
  };
// useEffect to update suggested FAQ and search query when userIssue changes
// useEffect to update suggested FAQ and search query when userIssue changes
useEffect(() => {
  const relevantFaq = findRelevantFaq(userIssue);
  setSuggestedFaq(relevantFaq);

  if (relevantFaq) {
    setSearchQuery(relevantFaq.question);
  }
}, [userIssue]);

  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter((faq) => {
    // If the user has not entered an issue, show all FAQs
    if (!userIssue) {
      const matchesCategory =
        activeCategory === null || faq.category === activeCategory;
      return matchesCategory;
    }

    // Otherwise, apply the search and category filters
    const searchTerm = searchQuery.toLowerCase();
    const matchesQuestion = faq.question
    .toLowerCase()
    .includes(searchTerm);
    const matchesAnswer = faq.answer.toLowerCase().includes(searchTerm);
    const matchesLiData = faq.liData
    ? faq.liData.some((item) => item.toLowerCase().includes(searchTerm))
    : false;
    const matchesAnswer2 = faq.answer2
    ? faq.answer2.toLowerCase().includes(searchTerm)
    : false;
    const matchesAnswer3 = faq.answer3
    ? faq.answer3.toLowerCase().includes(searchTerm)
    : false;

    const matchesSearch =
      matchesQuestion ||
      matchesAnswer ||
      matchesLiData ||
      matchesAnswer2 ||
      matchesAnswer3;

    const matchesCategory =
      activeCategory === null || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });
  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: 'rgba(41, 10, 71, 0.41)' }}>
      <div className="container mx-auto px-6">
     
        {/* AI-powered FAQ suggestion */}
        <div className="mb-4">
        <label htmlFor="userIssue" className="block font-bold mb-2 text-white">
  Describe your issue:
</label>

          <textarea
            id="userIssue"
            value={userIssue}
            onChange={(e) => setUserIssue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {suggestedFaq && (
            <div className="mt-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Suggested FAQ:</strong>
              <br />
              <span className="block sm:inline">{suggestedFaq.question}</span>
            </div>
          )}
       </div>
          {/* Search Bar */}
          

        <div className="mb-4 flex flex-wrap gap-2">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(
                  activeCategory === category.id? null: category.id
                )
              }
              className={`px-4 py-2 rounded-md ${
                activeCategory === category.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="wow fadeInUp space-y-6">
          {filteredFaqs.map((faq, index) => {
            if (faq.liData) {
              return (
                <FAQUl
                  key={index}
                  index={index}
                  openIndex={openIndex}
                  toggleFAQItem={toggleFAQItem}
                  question={faq.question}
                  answer={faq.answer}
                  liData={faq.liData}
                />
              );
            } else if (faq.answer2 || faq.answer3) {
              return (
                <MultipleFaq
                  key={index}
                  index={index}
                  openIndex={openIndex}
                  toggleFAQItem={toggleFAQItem}
                  question={faq.question}
                  answer={faq.answer}
                  answer2={faq.answer2}
                  answer3={faq.answer3}
                />
              );
            } else {
              return (
                <FAQItem
                  key={index}
                  index={index}
                  openIndex={openIndex}
                  toggleFAQItem={toggleFAQItem}
                  question={faq.question}
                  answer={faq.answer}
                />
              );
            }
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqContent;