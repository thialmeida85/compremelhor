import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ImportForm from "@/components/admin/ImportForm";

export default async function ImportMercadoLivrePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return <ImportForm />;
}
