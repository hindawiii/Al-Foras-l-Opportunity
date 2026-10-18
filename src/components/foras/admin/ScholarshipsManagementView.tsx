import React from "react";
import { Scholarship } from "@/lib/mockData";
import { AdminUser } from "@/lib/adminAuthStore";
import { ScholarshipListPane } from "./scholarships/ScholarshipListPane";
import { ScholarshipEditorPane } from "./scholarships/ScholarshipEditorPane";
import { ScholarshipInspectorPane } from "./scholarships/ScholarshipInspectorPane";

export interface ScholarshipsManagementViewProps {
  isRtl: boolean;
  dir: string;
  t: (key: string) => string;
  deviceSimulator: "desktop" | "tablet" | "phone";
  mobileViewPane: "list" | "detail";
  setMobileViewPane: (pane: "list" | "detail") => void;
  filteredScholarships: Scholarship[];
  scholarships: Scholarship[];
  hasActiveScholarshipFilters: boolean;
  resetScholarshipFilters: () => void;
  currentUser: AdminUser | null;
  scholarshipCategoryFilter: "all" | "arab" | "global";
  setScholarshipCategoryFilter: (filter: "all" | "arab" | "global") => void;
  scholarshipFundingFilter: "all" | "full" | "partial";
  setScholarshipFundingFilter: (filter: "all" | "full" | "partial") => void;
  scholarshipDegreeFilter: "all" | "bachelor" | "master" | "phd";
  setScholarshipDegreeFilter: (filter: "all" | "bachelor" | "master" | "phd") => void;
  scholarshipDeadlineFilter: "all" | "active" | "expiring_soon" | "expired";
  setScholarshipDeadlineFilter: (filter: "all" | "active" | "expiring_soon" | "expired") => void;
  scholarshipCategoryCounts: {
    all: number;
    arab: number;
    global: number;
    full: number;
    partial: number;
    bachelor: number;
    master: number;
    phd: number;
    expiring_soon: number;
    expired: number;
  };
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleToggleSelectItem: (id: string, idx: number, e: React.MouseEvent) => void;
  editingScholarship: Scholarship | null;
  setEditingScholarship: React.Dispatch<React.SetStateAction<Scholarship | null>>;
  calculateScholarshipScore: (s: any) => { score: number; grade: string; missing: string[] };
  isInspectorOpen: boolean;
  setIsInspectorOpen: (open: boolean) => void;
  scholarshipDuplicateResult: any;
  duplicateOverriddenId: string | null;
  setDuplicateOverriddenId: (id: string | null) => void;
  activeEditorTab: "basic" | "financial" | "eligibility" | "custom" | "urls";
  setActiveEditorTab: (tab: any) => void;
}

export const ScholarshipsManagementView: React.FC<ScholarshipsManagementViewProps> = (props) => {
  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
      <ScholarshipListPane {...props} />
      <ScholarshipEditorPane {...props} />
      <ScholarshipInspectorPane
        isRtl={props.isRtl}
        isInspectorOpen={props.isInspectorOpen}
        setIsInspectorOpen={props.setIsInspectorOpen}
        editingScholarship={props.editingScholarship}
        calculateScholarshipScore={props.calculateScholarshipScore}
      />
    </div>
  );
};
