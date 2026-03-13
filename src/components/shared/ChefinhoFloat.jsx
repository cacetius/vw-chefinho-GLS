import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AssistenteIA from "@/components/dialogo/AssistenteIA";

export default function ChefinhoFloat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-13 h-13 bg-gradient-to-br from-[#001e50] to-[#0066b1] rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/20 hover:shadow-2xl transition-shadow"
        style={{ width: 52, height: 52 }}
        title="Falar com Chefinho"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.span key="emoji" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.18 }}
              className="text-2xl leading-none">👷</motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-[88px] right-4 lg:bottom-[76px] lg:right-6 z-40 w-[calc(100vw-32px)] max-w-sm shadow-2xl rounded-2xl"
            style={{ maxHeight: "72vh" }}
          >
            <AssistenteIA compact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}