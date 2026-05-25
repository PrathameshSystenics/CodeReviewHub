"use client";

import FormField from "@/components/auth/FormField";
import { forgotPasswordApi } from "@/api/auth";
import { forgotPasswordSchema, type ForgotPasswordInputs } from "@/schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";

//#region Font Declaration
const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

const jetbrains_mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
});
//#endregion

const ForgotPasswordForm = () => {
  const [otp, setOtp] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  //#region React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    shouldFocusError: true,
    mode: "onTouched",
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      const result = await forgotPasswordApi(data);
      if (result.status !== "success") {
        toast.error(result.message || "Failed to process password reset");
        return;
      }
      setSubmittedEmail(data.email);
      setOtp(result.data?.otp ?? null);
    } catch {
      toast.error("Something went wrong");
    }
  };
  //#endregion

  if (otp) {
    return (
      <div className={`${inter.className} space-y-5`}>
        <div className="text-center space-y-1">
          <p className="text-gray-400 text-sm">Reset code generated for</p>
          <p className="text-white font-medium">{submittedEmail}</p>
        </div>

        <div className="bg-[#1c2436] rounded-xl p-6 text-center border border-primary/20">
          <p className="text-gray-400 text-xs tracking-widest mb-3">
            YOUR RESET CODE
          </p>
          <p
            className={`${jetbrains_mono.className} text-4xl font-bold text-primary tracking-[0.4em]`}
          >
            {otp}
          </p>
          <p className="text-gray-500 text-xs mt-3">Expires in 5 minutes</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-yellow-400 text-xs text-center">
            Copy this code before navigating away
          </p>
        </div>

        <Link
          href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
          className={`${space_grotesk.className} text-black w-full py-4 rounded-xs bg-linear-to-r from-primary to-primary-dark flex items-center justify-center space-x-3 font-bold`}
        >
          <span>Continue to Reset Password</span>
          <FaArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${inter.className} text-gray-400 space-y-5`}
    >
      <FormField
        label="EMAIL"
        htmlFor="email"
        inputProps={{
          type: "email",
          placeholder: "dev@codereview.hub",
        }}
        register={register("email")}
        extra={
          <div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        }
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${space_grotesk.className} text-black w-full py-4 rounded-xs bg-linear-to-r from-primary to-primary-dark space-x-3 font-bold disabled:opacity-50`}
      >
        <span>{isSubmitting ? "Generating code..." : "Get Reset Code"}</span>
        <FaArrowRight className="inline-block" size={15} />
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
