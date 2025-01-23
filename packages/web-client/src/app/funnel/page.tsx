import dynamic from "next/dynamic";

const Funnel = dynamic(() => import("@/components/Funnel"), {
  ssr: false,
});

function FunnelPage() {
  return <Funnel />;
}
export default FunnelPage;
