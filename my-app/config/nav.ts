import { SidebarLink } from "@/components/SidebarItems";
import { Cog, Globe, HomeIcon } from "lucide-react";

type AdditionalLinks = {
  title: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: HomeIcon },
  { href: "/account", title: "Account", icon: Cog },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
  {
    title: "Entities",
    links: [
      {
        href: "/checkin-sections",
        title: "Checkin Sections",
        icon: Globe,
      },
      {
        href: "/group-of-tickets",
        title: "Group Of Tickets",
        icon: Globe,
      },
      {
        href: "/events",
        title: "Events",
        icon: Globe,
      },
      {
        href: "/organizers",
        title: "Organizers",
        icon: Globe,
      },
    ],
  },

];

