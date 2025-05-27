import { Computer, Linkedin, ScrollIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Button } from "./button";

const Footer = () => {
  return (
    <footer className="py-4">
      <div className="flex flex-col items-center">
        <div className="mb-8 rounded-full   p-8">
          <Image
            src="/images/Logo.png"
            alt="Fund the World"
            width={96}
            height={96}
            className="w-24 h-24"
          />
        </div>
        <div className="mb-8 flex space-x-4">
          <Link href="https://github.com/5eh/btc-vegas">
            <Button variant="outline" size="icon" className="">
              <GitHubLogoIcon className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Link href="https://b25.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open">
            <Button variant="outline" size="icon" className="">
              <Computer className="h-4 w-4" />
              <span className="sr-only">DevPost</span>
            </Button>
          </Link>
          <Link href="https://github.com/5eh/btc-vegas/blob/main/README.md">
            <Button variant="outline" size="icon" className="">
              <ScrollIcon className="h-4 w-4" />
              <span className="sr-only">Documentation</span>
            </Button>
          </Link>
        </div>
        <div className="py-2">Are you an organization?</div>
        <div className="mb-8 w-full max-w-md flex justify-center">
          <Link href="/submit">
            <Button className="bg-primary rounded-full text-white hover:bg-primary/70 hover:border hover:border-primary">
              Create your spotlight!
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
