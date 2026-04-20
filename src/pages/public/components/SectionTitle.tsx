import HomeLayout from "@/pages/public/components/HomeLayout.tsx";


const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-8 inline-block border-b-[3px] border-secondary pb-2 text-2xl font-black text-primary">
    {children}
  </h2>

);

export default SectionTitle;
