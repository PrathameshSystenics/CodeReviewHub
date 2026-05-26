"use client";

import { CodeStatus, Sort } from "@/types/browse";
import { Inter, Space_Grotesk } from "next/font/google";
import { useSearchParams } from "next/navigation";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
//#endregion

const BrowsePosts = () => {
  //#region State and Hooks
  const searchparams = useSearchParams();
  //#endregion

  const currentSort = (searchparams.get("sort") as Sort) || "newest";
  const poststatus = (searchparams.get("codestatus") as CodeStatus) || "all";

  //#region React Query

  //#endregion

  return <div>BrowsePosts</div>;
};

export default BrowsePosts;
