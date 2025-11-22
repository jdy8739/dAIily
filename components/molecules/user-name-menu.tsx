"use client";

import { FileText, Trophy } from "lucide-react";
import PopupMenu from "../atoms/popup-menu";

interface UserNameMenuProps {
  userId: string;
  userName: string;
  className?: string;
}

const UserNameMenu = ({
  userId,
  userName,
  className = "",
}: UserNameMenuProps) => {
  const menuItems = [
    {
      label: "View Feed",
      href: `/feed/user/${userId}?tab=feed`,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "View Story",
      href: `/story/${userId}`,
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  return (
    <PopupMenu
      trigger={
        <span
          className={`text-primary hover:text-primary/80 font-semibold ${className}`}
        >
          {userName}
        </span>
      }
      items={menuItems}
    />
  );
};

export default UserNameMenu;
