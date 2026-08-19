import React from 'react';


const PaymentButton = ({ title, bgColor, logo, onClick = () => { }, disabled = false }) => {
    return (
        <button 
            className={`relative overflow-hidden rounded-lg p-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            style={{
                backgroundColor: bgColor
            }}
        >
            <div className="flex flex-col items-center justify-center gap-1.5">
                <img src={logo} alt={title} className="w-7 h-7" />
                <span className="text-white text-[11px] font-semibold leading-tight">{title}</span>
            </div>
        </button>
    );
};

export default PaymentButton;
