import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserX,
  Flag,
  ShieldCheck,
  Settings,
  MessageSquare,
  Calendar,
  BarChart3,
  DollarSign,
  Mail,
  Palette
} from 'lucide-react';

const sidebarItems = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "USER MANAGEMENT", 
    items: [
      { name: "All Members", href: "/members", icon: Users },
      { name: "New Signups", href: "/signups", icon: UserPlus, badge: "24" },
      { name: "Premium Members", href: "/premium", icon: Users },
      { name: "Banned Users", href: "/banned", icon: UserX },
    ]
  },
  {
    title: "CONTENT MODERATION",
    items: [
      { name: "Profile Verifications", href: "/verifications", icon: ShieldCheck, badge: "18" },
      { name: "Reported Content", href: "/reports", icon: Flag, badge: "142" },
      { name: "Media Moderation", href: "/media", icon: MessageSquare },
    ]
  },
  {
    title: "COMMUNITY FEATURES", 
    items: [
      { name: "Messenger Monitoring", href: "/messenger", icon: MessageSquare },
      { name: "Live Chatrooms", href: "/chatrooms", icon: MessageSquare },
      { name: "Speed Date", href: "/speed-date", icon: Calendar },
      { name: "Parties & Events", href: "/events", icon: Calendar },
      { name: "Groups", href: "/groups", icon: Users },
      { name: "Forum", href: "/forum", icon: MessageSquare },
    ]
  },
  {
    title: "ANALYTICS",
    items: [
      { name: "User Statistics", href: "/analytics/users", icon: BarChart3 },
      { name: "Engagement Metrics", href: "/analytics/engagement", icon: BarChart3 },
      { name: "Revenue Reports", href: "/analytics/revenue", icon: DollarSign },
    ]
  },
  {
    title: "SYSTEM SETTINGS",
    items: [
      { name: "Payment Configuration", href: "/settings/payment", icon: DollarSign },
      { name: "Email Templates", href: "/settings/email", icon: Mail },
      { name: "API Settings", href: "/settings/api", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
            2+1
          </div>
          <span className="text-lg font-semibold text-white">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive 
                          ? "bg-blue-600 text-white" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">AU</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">Super Admin</p>
          </div>
          <Settings className="w-4 h-4 text-slate-400" />
        </div>
      </div> */}
    </div>
  );
}
