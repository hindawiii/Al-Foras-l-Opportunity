import { ArabUniversitiesTab } from "@/pages/app/ArabUniversitiesTab";

export interface Props {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  userPercentage?: number;
}

export const UniversitiesGuide = (_props: Props) => {
  return <ArabUniversitiesTab />;
};

export default UniversitiesGuide;
