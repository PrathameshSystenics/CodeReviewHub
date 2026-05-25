"use client";

import FormField from "@/components/auth/FormField";
import { changePasswordApi } from "@/api/auth";
import { changePasswordSchema, type ChangePasswordInputs } from "@/schemas/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { Inter, Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { toast } from "react-toastify";

//#region Font Declaration
const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});
//#endregion

const ChangePasswordForm = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  //#region React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInputs>({
    shouldFocusError: true,
    mode: "onTouched",
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInputs) => {
    try {
      const result = await changePasswordApi(data);
      if (result.status !== "success") {
        toast.error(result.message || "Failed to change password");
        return;
      }
      toast.success("Password changed successfully!");
      router.push("/");
    } catch {
      toast.error("Something went wrong");
    }
  };
  //#endregion

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${inter.className} text-gray-400 space-y-5`}
    >
      <FormField
        label="CURRENT PASSWORD"
        htmlFor="currentPassword"
        inputProps={{
          type: showCurrent ? "text" : "password",
          placeholder: "••••••••",
        }}
        register={register("currentPassword")}
        extra={
          <>
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showCurrent ? (
                <MdOutlineVisibilityOff size={20} />
              ) : (
                <MdOutlineVisibility size={20} />
              )}
            </button>
            <div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          </>
        }
      />

      <FormField
        label="NEW PASSWORD"
        htmlFor="newPassword"
        inputProps={{
          type: showNew ? "text" : "password",
          placeholder: "••••••••",
        }}
        register={register("newPassword")}
        extra={
          <>
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showNew ? (
                <MdOutlineVisibilityOff size={20} />
              ) : (
                <MdOutlineVisibility size={20} />
              )}
            </button>
            <div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </>
        }
      />

      <FormField
        label="CONFIRM NEW PASSWORD"
        htmlFor="confirmPassword"
        inputProps={{
          type: showConfirm ? "text" : "password",
          placeholder: "••••••••",
        }}
        register={register("confirmPassword")}
        extra={
          <>
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirm ? (
                <MdOutlineVisibilityOff size={20} />
              ) : (
                <MdOutlineVisibility size={20} />
              )}
            </button>
            <div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </>
        }
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${space_grotesk.className} text-black w-full py-4 rounded-xs bg-linear-to-r from-primary to-primary-dark space-x-3 font-bold disabled:opacity-50`}
      >
        <span>{isSubmitting ? "Updating..." : "Change Password"}</span>
        <FaArrowRight className="inline-block" size={15} />
      </button>
    </form>
  );
};

export default ChangePasswordForm;
