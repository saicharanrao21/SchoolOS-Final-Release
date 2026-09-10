'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Search, Star, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { ENTERPRISE_NAVIGATION_REGISTRY } from '../../lib/registries/navigation-registry';
import { usePreferences } from '../../lib/stores/preferences-store';

export function Sidebar() {
  const pathname = usePathname();
  const { preferences, toggleSidebar, addFavorite, removeFavorite } = usePreferences();
  const [navSearch, setNavSearch] = useState('');
  const [openGroups, setOpenDropdowns] = useState<Record<string, boolean>>({
    'Academics': true,
    'Fees & Finance': true,
    'Attendance': true,
  });

  const isCollapsed = preferences.sidebarCollapsed;

  const toggleGroup = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredNav = ENTERPRISE_NAVIGATION_REGISTRY.map((group) => {
    if (!navSearch) return group;
    const matchesGroup = group.label.toLowerCase().includes(navSearch.toLowerCase());
    const matchedChildren = group.children?.filter((c) =>
      c.label.toLowerCase().includes(navSearch.toLowerCase()),
    );
    if (matchesGroup || (matchedChildren && matchedChildren.length > 0)) {
      return { ...group, children: matchedChildren || group.children };
    }
    return null;
  }).filter(Boolean);

  return (
    <aside
      className={clsx(
        'bg-sidebar-background flex flex-col h-screen text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-white/5 select-none shrink-0 z-30',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">SchoolOS</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Enterprise OS</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:text-white p-1 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter / Search Bar */}
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Filter modules..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNav.map((group) => {
          if (!group) return null;
          const isGroupOpen = !!openGroups[group.label] || !!navSearch;

          if (group.children) {
            return (
              <div key={group.label} className="space-y-1">
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <group.icon className="w-3.5 h-3.5 text-text-muted" />
                      <span>{group.label}</span>
                    </div>
                    {isGroupOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                ) : (
                  <div className="p-2 text-center text-text-muted" title={group.label}>
                    <group.icon className="w-4 h-4 mx-auto" />
                  </div>
                )}

                {(isGroupOpen || isCollapsed) &&
                  group.children.map((child) => {
                    const isActive = pathname === child.href;
                    const isFav = preferences.favorites.includes(child.href);

                    return (
                      <div key={child.href} className="group/item flex items-center">
                        <Link
                          href={child.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 flex-1',
                            isActive
                              ? 'bg-sidebar-active text-white font-bold shadow-sm'
                              : 'hover:bg-sidebar-active/50 hover:text-white font-medium text-sidebar-foreground',
                            isCollapsed && 'justify-center px-0 py-2.5',
                          )}
                          title={isCollapsed ? child.label : undefined}
                        >
                          <child.icon
                            className={clsx(
                              'w-4 h-4 shrink-0',
                              isActive ? 'text-primary font-bold' : 'text-text-muted group-hover/item:text-white',
                            )}
                          />
                          {!isCollapsed && <span className="text-xs truncate">{child.label}</span>}
                        </Link>

                        {!isCollapsed && (
                          <button
                            onClick={() => (isFav ? removeFavorite(child.href) : addFavorite(child.href))}
                            className={clsx(
                              'p-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity',
                              isFav ? 'opacity-100 text-amber-400' : 'text-text-muted hover:text-amber-400',
                            )}
                            title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          }

          // Single Direct Item
          const isActive = pathname === group.href;
          return (
            <Link
              key={group.label}
              href={group.href!}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-sidebar-active text-white font-bold shadow-sm'
                  : 'hover:bg-sidebar-active/50 hover:text-white font-medium text-sidebar-foreground',
                isCollapsed && 'justify-center px-0',
              )}
              title={isCollapsed ? group.label : undefined}
            >
              <group.icon
                className={clsx(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-primary font-bold' : 'text-text-muted group-hover:text-white',
                )}
              />
              {!isCollapsed && <span className="text-xs">{group.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/5 bg-sidebar-background/50 backdrop-blur-xs">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.href = '/auth/login';
            }
          }}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 font-semibold text-xs',
            isCollapsed && 'justify-center px-0',
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 text-red-400 shrink-0" />
          {!isCollapsed && <span>Logout Session</span>}
        </button>
      </div>
    </aside>
  );
}
