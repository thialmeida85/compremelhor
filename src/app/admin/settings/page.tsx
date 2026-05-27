import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AdminSettings() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-offwhite py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brand-graphite mb-2">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências de conta e altere sua senha.</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-brand-graphite bg-white px-6 py-3 text-sm font-semibold text-brand-graphite hover:bg-brand-offwhite transition"
          >
            Voltar ao dashboard
          </Link>
        </div>

        <div className="space-y-8">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
