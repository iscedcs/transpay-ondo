"use client";

import PaymentDisplay from "@/components/shared/payment-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PaymentNotification } from "@prisma/client";
import { differenceInSeconds, formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface PaymentData {
  payments: PaymentNotification[];
  dailyTotal: number;
}

export default function LivePaymentNotificationsAdminAccess() {
  const [cvofPaymentData, setcvofPaymentData] = useState<PaymentData | null>(
    null
  ); // Initialize as null
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const NEW_PAYMENT_THRESHOLD_SECONDS = 1;

  const fetchCvofPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/payment-notifications/cvof");
      if (!res.ok) {
        throw new Error(
          `Failed to fetch payments: ${res.status} ${res.statusText}`
        );
      }
      const data = await res.json();
      setcvofPaymentData(data);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to fetch payment notifications");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCvofPayments();

    const interval = setInterval(() => {
      fetchCvofPayments();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchCvofPayments]);

  if (isLoading || !cvofPaymentData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 text-2xl font-bold"
        >
          Payment Notifications
        </motion.h1>
        <div>Loading...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 text-2xl font-bold"
        >
          Payment Notifications
        </motion.h1>
        <div className="text-red-500">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4 text-2xl font-bold"
      >
        Payment Notifications
      </motion.h1>
      <div className="grid">
        {cvofPaymentData && <PaymentDisplay check="cvof" />}
      </div>
      <AnimatePresence>
        <Tabs defaultValue="cvof">
          <TabsList className="mx-auto overflow-y-scroll lg:overflow-auto w-full">
            <TabsTrigger value="cvof">
              Commercial Vehicle Operational Fee
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cvof">
            {cvofPaymentData.payments.map((payment) => {
              const isNew =
                differenceInSeconds(new Date(), new Date(payment.createdAt)) <
                NEW_PAYMENT_THRESHOLD_SECONDS;
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: isNew ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-2 flex items-center justify-between rounded-lg p-3 shadow ${
                    isNew ? "bg-green-100" : "bg-white"
                  }`}
                >
                  <motion.div
                    className="flex items-center space-x-4"
                    initial={false}
                    animate={isNew ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="font-semibold text-blue-500">₦</span>
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-semibold">
                        {payment.customerName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {payment.revenueName}
                      </p>
                    </div>
                  </motion.div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      ₦{Number(payment.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(payment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </AnimatePresence>
    </motion.div>
  );
}
