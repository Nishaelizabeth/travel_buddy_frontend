"use client"
import React from 'react';
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Upload } from 'lucide-react';

// Reusable Input Component
export const AuthInput = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    error,
    placeholder,
    icon: Icon,
    isValidating,
    className,
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
        <div className={cn("mb-4", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    type={isPassword && showPassword ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        "w-full px-4 py-3 rounded-lg border transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        Icon && "pl-10",
                        isPassword && "pr-10",
                        error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400",
                        isValidating && "animate-pulse"
                    )}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
                {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Reusable Select Component
export const AuthSelect = ({
    label,
    name,
    value,
    onChange,
    error,
    options,
    placeholder,
    className,
    ...props
}) => {
    return (
        <div className={cn("mb-4", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={cn(
                    "w-full px-4 py-3 rounded-lg border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "appearance-none bg-white cursor-pointer",
                    error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                )}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Primary Button Component
export const AuthButton = ({
    children,
    loading,
    type = "button",
    variant = "primary",
    className,
    ...props
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-50"
    };

    return (
        <button
            type={type}
            disabled={loading}
            className={cn(
                "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                </div>
            ) : children}
        </button>
    );
};

// Navigation Arrow Buttons
export const NavArrow = ({ direction, onClick, disabled, className }) => {
    const isBack = direction === "back";
    const Icon = isBack ? ChevronLeft : ChevronRight;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "absolute bottom-6 p-3 rounded-full transition-all duration-200 shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isBack
                    ? "left-6 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
                className
            )}
        >
            <Icon className="w-6 h-6" />
        </motion.button>
    );
};

// Auth Card Container
export const AuthCard = ({ children, className, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8",
                "w-full max-w-md relative",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Auth Container with background
export const AuthContainer = ({ children, backgroundVideo, className }) => {
    return (
        <div className={cn(
            "min-h-screen flex items-center justify-center p-4",
            "bg-gradient-to-br from-blue-50 via-white to-purple-50",
            className
        )}>
            {backgroundVideo && (
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={backgroundVideo} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                </div>
            )}
            <div className="relative z-10 w-full flex justify-center">
                {children}
            </div>
        </div>
    );
};

// Step Indicator for multi-step forms
export const StepIndicator = ({ currentStep, totalSteps, labels }) => {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
                <div key={step} className="flex items-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{
                            scale: currentStep === step ? 1.1 : 1,
                            backgroundColor: currentStep >= step ? "#3B82F6" : "#E5E7EB"
                        }}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                            currentStep >= step ? "text-white" : "text-gray-500"
                        )}
                    >
                        {step}
                    </motion.div>
                    {labels && labels[index] && (
                        <span className={cn(
                            "ml-2 text-sm hidden sm:inline",
                            currentStep === step ? "text-blue-600 font-medium" : "text-gray-500"
                        )}>
                            {labels[index]}
                        </span>
                    )}
                    {index < totalSteps - 1 && (
                        <div className={cn(
                            "w-8 h-0.5 mx-2",
                            currentStep > step ? "bg-blue-500" : "bg-gray-200"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );
};

// Error Alert Component
export const ErrorAlert = ({ message }) => {
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
        >
            {message}
        </motion.div>
    );
};

// Profile Preview Component
export const ProfilePreview = ({ formData }) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {formData.profile_picture ? (
                    <img
                        src={URL.createObjectURL(formData.profile_picture)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    formData.full_name?.[0]?.toUpperCase() || 'U'
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{formData.full_name || 'Your Name'}</h3>
                <p className="text-sm text-gray-500 truncate">@{formData.username || 'username'}</p>
                <p className="text-sm text-gray-400 truncate">{formData.email || 'email@example.com'}</p>
            </div>
        </div>
    );
};

export default {
    AuthInput,
    AuthSelect,
    AuthButton,
    NavArrow,
    AuthCard,
    AuthContainer,
    StepIndicator,
    ErrorAlert,
    ProfilePreview
};
