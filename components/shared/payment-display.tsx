import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { getPaymentTotals } from "@/actions/payment-notification";

interface PaymentDisplayProps {
     check: "cvof" | "dmf" | "ff";
}

export default function PaymentDisplay({ check }: PaymentDisplayProps) {
     const [cvofDaily, setCvofDaily] = useState<number>(0);
     const [dmfDaily, setDmfDaily] = useState<number>(0);
     const [ffDaily, setFfDaily] = useState<number>(0);
     const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     const fetchCVOFDailyDisplay = useCallback(async () => {
       try {
         const CVOF = await getPaymentTotals({ revenueType: "CVOF" });
         setCvofDaily(Number(CVOF.dayToDateTotal));
       } catch (e) {
         setError("Failed to fetch CVOG payments");
       }
     }, []);

     const fetchDMFDailyDisplay = useCallback(async () => {
       try {
         const ISCE = await getPaymentTotals({ revenueType: "ISCE" });
         setDmfDaily(Number(ISCE.dayToDateTotal));
       } catch (e) {
         setError("Failed to fetch DFM payments");
       }
     }, []);

     const fetchFFDailyDisplay = useCallback(async () => {
       try {
         const FAREFLEX = await getPaymentTotals({ revenueType: "FAREFLEX" });

         setFfDaily(Number(FAREFLEX.dayToDateTotal));
       } catch (e) {
         setError("Failed to fetch FF payments");
       }
     }, []);

     useEffect(() => {
          const fetchAll = async () => {
              try {
                  await Promise.all([fetchCVOFDailyDisplay(), fetchDMFDailyDisplay(), fetchFFDailyDisplay()]);
                  setIsLoading(false);
              } catch (e) {
                  setIsLoading(false);
              }
          };
  
          fetchAll();
  
          const interval = setInterval(() => {
              fetchCVOFDailyDisplay();
              fetchDMFDailyDisplay();
              fetchFFDailyDisplay();
          }, 1000);
          return () => clearInterval(interval);
      }, [fetchCVOFDailyDisplay, fetchDMFDailyDisplay, fetchFFDailyDisplay]);

      if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 rounded-lg bg-muted p-4"
            >
                <div>Loading...</div>
            </motion.div>
        );
    }

    if (error) {
     return (
         <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3, duration: 0.5 }}
             className="mb-4 rounded-lg bg-muted p-4"
         >
             <div className="text-red-500">{error}</div>
         </motion.div>
     );
 }
 return (
     <motion.div
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3, duration: 0.5 }}
         className="mb-4 rounded-lg bg-muted p-4"
     >
         {check === "cvof" && cvofDaily !== null ? (
             <div className="">
                 <h2 className="mb-2 text-lg font-semibold">CVOF Total</h2>
                 <p className="text-2xl font-bold">{formatCurrency(Number(cvofDaily))}</p>
             </div>
         ) : check === "dmf" && dmfDaily !== null ? (
             <div className="">
                 <h2 className="mb-2 text-lg font-semibold">Device Maintenance Fee Total</h2>
                 <p className="text-2xl font-bold">{formatCurrency(Number(dmfDaily))}</p>
             </div>
         ) : check === "ff" && ffDaily !== null ? (
             <div className="">
                 <h2 className="mb-2 text-lg font-semibold">Fair Flex Fee Total</h2>
                 <p className="text-2xl font-bold">{formatCurrency(Number(ffDaily))}</p>
             </div>
         ) : (
             <div>No data available</div>
         )}
     </motion.div>
 );
}
