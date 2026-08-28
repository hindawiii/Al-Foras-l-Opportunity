import { motion } from "framer-motion";

const logoFull = "/al-foras-logo.png";
const logoIcon = "/al-foras-icon.png";

export const Logo = ({ size = 64 }: { size?: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", duration: 0.8 }}
    className="relative inline-flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <img
      src={logoIcon}
      alt="الفُرَص"
      className="w-full h-full object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
      draggable={false}
    />
  </motion.div>
);

export const BrandMark = ({ size = 56 }: { size?: number }) => (
  <div className="inline-flex items-center">
    <img
      src={logoFull}
      alt="الفُرَص — Al-Foras"
      style={{ height: size }}
      className="w-auto object-contain drop-shadow-[0_0_22px_hsl(var(--primary)/0.4)] select-none mb-0 mr-0 ml-0 mt-0 py-0 pr-0 pt-0 px-0"
      draggable={false}
    />
  </div>
);
