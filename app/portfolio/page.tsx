import { getPortfolio } from "@/lib/meta";

import { PortfolioView } from "./portfolio-view";

export default async function PortfolioPage() {
  const data = await getPortfolio();
  return <PortfolioView data={data} />;
}
