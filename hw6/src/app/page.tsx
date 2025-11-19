import StatsDashboard from "@/components/stats/StatsDashboard";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">統計儀表板</h1>
          <Link href="/conversations">
            <Button>查看對話紀錄</Button>
          </Link>
        </div>
        <StatsDashboard />
      </div>
    </main>
  );
}

