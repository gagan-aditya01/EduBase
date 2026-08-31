"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface SidebarLinkItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: string | number;
  danger?: boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen sticky top-0 px-3 py-4 hidden md:flex md:flex-col transition-colors duration-300 w-[260px] flex-shrink-0 z-40 border-r-0 shadow-[1px_0_12px_rgba(0,0,0,0.03)]",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 py-3 flex flex-row md:hidden items-center justify-between border-b w-full sticky top-0 z-40 backdrop-blur-md"
        )}
        {...props}
      >
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-sm tracking-tight gradient-text">EduBase Portal</span>
          <Menu
            className="cursor-pointer text-zinc-400"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 p-6 z-[100] flex flex-col justify-between backdrop-blur-3xl",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 cursor-pointer p-2 rounded-full border border-zinc-800"
                onClick={() => setOpen(!open)}
              >
                <X size={18} />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
}: {
  link: SidebarLinkItem;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <button
      type="button"
      onClick={link.onClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-2xl transition-all duration-150 cursor-pointer w-full text-left font-semibold text-xs select-none",
        link.danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-[#cc5a37] dark:hover:text-white",
        className
      )}
    >
      <div className="shrink-0 flex items-center justify-center">{link.icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="truncate whitespace-nowrap"
      >
        {link.label}
      </motion.span>

      {link.badge && open && (
        <motion.span
          animate={{ opacity: open ? 1 : 0 }}
          className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          {link.badge}
        </motion.span>
      )}
    </button>
  );
};
