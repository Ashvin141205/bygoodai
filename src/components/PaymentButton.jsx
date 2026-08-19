import React from 'react';


const PaymentButton = ({ title, bgColor, logo, onClick = () => {}, isClicked }) => {
    return (
        <button
            className="flex justify-center items-center px-4 py-2.5 rounded-lg transition-all duration-200"
            onClick={onClick}
            style={{
                backgroundColor: bgColor,
                opacity: isClicked ? 1 : 0.5, // Adjusts border and button opacity
            }}
        >
            <img src={logo} alt={title} className="w-5 h-5 mr-2" />
            <span className="text-white font-semibold">{title}</span>
        </button>
    );
};


export default PaymentButton;
