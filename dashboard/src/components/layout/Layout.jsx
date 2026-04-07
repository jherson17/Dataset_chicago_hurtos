import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children, activeTab, setActiveTab }) {
  return (
    <div className="flex min-h-screen bg-darkBg text-white font-sans selection:bg-accentPurple/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <Topbar title={activeTab} />
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
