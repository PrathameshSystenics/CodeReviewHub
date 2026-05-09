"use client";

import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

interface UserProfileImageProps {
  image?: string | null;
  name: string;
  imageclassName: ClassValue;
  badgeclassName: ClassValue;
}

const UserProfileImage = ({
  name,
  image,
  badgeclassName,
  imageclassName,
}: UserProfileImageProps) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name || "Author"}
        className={cn("rounded-full", imageclassName)}
      />
    );
  }
  return (
    <span
      className={cn(
        "bg-linear-to-r from-primary to-primary-dark font-semibold text-black rounded-full uppercase text-sm",
        badgeclassName,
      )}
    >
      {name?.slice(0, 2) ?? "US"}
    </span>
  );
};

export default UserProfileImage;
