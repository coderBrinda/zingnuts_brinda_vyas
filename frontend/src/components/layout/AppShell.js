import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
