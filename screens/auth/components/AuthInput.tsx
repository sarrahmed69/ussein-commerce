"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TbEye, TbEyeOff } from "react-icons/tb";

interface AuthInputProps {
  type?: string;
  name: string;
  label: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
}

const AuthInput: React.FC<AuthInputProps> = ({ type = "text", name, label, icon, ...props }) => {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="flex flex-col mt-4">
      <label htmlFor={name} className="text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <input
          className={cn(
            "w-full h-11 pl-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            isPassword ? "pr-10" : icon ? "pr-10" : "pr-4"
          )}
          type={inputType}
          name={name}
          id={name}
          placeholder={label.replace(" *", "")}
          {...props}
        />
        {isPassword ? (
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors">
            {showPw ? <TbEyeOff size={18} /> : <TbEye size={18} />}
          </button>
        ) : icon ? (
          <span className="absolute right-3 text-gray-400">{icon}</span>
        ) : null}
      </div>
    </div>
  );
};

export default AuthInput;