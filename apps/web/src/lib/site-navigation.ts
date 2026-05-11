import { hasAnyBackofficeAccess } from "@/lib/access-control";
import { mainNavigation, type SiteLink } from "@/lib/public-content";

const BACKOFFICE_NAVIGATION_LINK: SiteLink = {
  href: "/backoffice",
  label: "Backoffice"
};

export function buildMainNavigation(roles: string[]): SiteLink[] {
  if (!hasAnyBackofficeAccess(roles)) {
    return mainNavigation;
  }

  return [...mainNavigation, BACKOFFICE_NAVIGATION_LINK];
}

