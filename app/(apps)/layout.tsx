export const dynamic = "force-dynamic";
import BackButton from "@/components/common/BackButton";

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackButton />
      {children}
    </>
  );
}