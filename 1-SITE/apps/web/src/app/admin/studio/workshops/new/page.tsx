import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { redirect } from "next/navigation";
import { PageWrapperInstrument, ContainerInstrument, HeadingInstrument } from "@/components/ui/LayoutInstruments";
import CreateEditionForm from "./CreateEditionForm";

export default async function CreateEditionPage() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) redirect('/studio');

  const workshops = await StudioDataBridge.getWorkshops();
  const instructors = await StudioDataBridge.getInstructors();

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-2xl mx-auto">
      <ContainerInstrument className="mb-12">
        <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter">Nieuwe Editie</HeadingInstrument>
        <p className="text-black/40 mt-2">Plan een nieuwe workshop sessie in de studio.</p>
      </ContainerInstrument>

      <CreateEditionForm workshops={workshops} instructors={instructors} />
    </PageWrapperInstrument>
  );
}
