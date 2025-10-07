"use client";

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
      icon: "📝",
    },
    {
      label: "View Story",
      href: `/story/${userId}`,
      icon: "🏆",
    },
  ];

  return (
    <PopupMenu
      trigger={
        <span
          className={`text-blue-500 hover:text-blue-400 font-semibold ${className}`}
        >
          {userName}
        </span>
      }
      items={menuItems}
    />
  );
};

export default UserNameMenu;
