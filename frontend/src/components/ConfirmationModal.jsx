import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isAlert = false, confirmText = "Confirm Action", cancelText = "Dismiss" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
            <div className="bg-[#3b2a20] rounded-[2.5rem] shadow-2xl w-full max-w-md transform transition-all scale-100 p-8 border border-white/5 relative overflow-hidden">
                {/* Close Button (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all text-xl"
                >
                    ×
                </button>

                <div className="text-center mt-4">
                    <h3 className="text-3xl font-bold text-[#8C6B46] mb-4 font-outfit uppercase tracking-widest opacity-90 drop-shadow-sm">
                        {title}
                    </h3>
                    <p className="text-white/60 mb-10 font-light text-lg leading-relaxed px-4">
                        {message}
                    </p>

                    <div className="flex flex-col-reverse gap-4">
                        {!isAlert && (
                            <button
                                onClick={onClose}
                                className="px-6 py-4 rounded-xl text-[#8C6B46] font-extrabold tracking-[0.2em] text-sm hover:text-[#bca07d] transition-colors uppercase"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={isAlert ? onClose : onConfirm}
                            className="w-full px-6 py-4 rounded-2xl bg-[#8C6B46] text-[#2A1B12] font-extrabold text-sm tracking-[0.2em] shadow-lg hover:bg-[#a38058] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase"
                        >
                            {isAlert ? 'OK' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
