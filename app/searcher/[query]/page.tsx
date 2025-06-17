import SearchVehicle from "@/components/pages/vehicle/search-vehicle";

export default async function SearchPage({ params }: { params: Promise<{ query: string }> }) {
     const { query } = await params;
     return (
          <div className="w-full pt-16">
               <SearchVehicle id={query} />
          </div>
     );
}
