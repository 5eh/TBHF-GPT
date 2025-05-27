import { motion } from "framer-motion";
import { BitcoinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <BitcoinIcon />
          <Image src={"/images/icon.png"} height={32} width={32} alt="FTW" />
        </p>
        <p>
          <code className="text-primary rounded-none bg-muted-foreground/15 px-1.5 py-0.5">
            Fund The World
          </code>{" "}
          is an open blockchain initiative focused on enabling charities to
          further expose social issues and raise funds.
        </p>
        <p>
          {" "}
          You can find charities that follow your beliefs below. Type{" "}
          <code className="text-primary rounded-none bg-muted-foreground/15 px-1.5 py-0.5">
            Donate
          </code>{" "}
          to make a finacial contribution to any charity on this platform in{" "}
          <code className="text-[#f7931a] rounded-none bg-muted-foreground/15 px-1.5 py-0.5 flex w-fit gap-2 justify-center">
            <Image src={"images/icon.svg"} height={16} width={16} alt="BTC" />
            Bitcoin!
          </code>
        </p>
      </div>
    </motion.div>
  );
};
