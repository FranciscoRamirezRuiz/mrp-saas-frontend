// src/components/common/PromptModal.js
import React, { useState, useEffect } from 'react';

const PromptModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    message,
    inputType = 'none', // 'none' para confirmación, 'text' para prompt
    initialValue = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
}) => {
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setInputValue(initialValue);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}
                    
                    {inputType === 'text' && (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                            autoFocus
                            required
                        />
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;