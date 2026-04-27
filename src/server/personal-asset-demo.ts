import { PersonalAssetSnapshotInput } from "@/lib/validators";

export function getDemoSnapshots(): PersonalAssetSnapshotInput[] {
  return [
    {
      id: "demo_snapshot_20260427",
      recordDate: "2026-04-27",
      title: "2026-04-27 资产快照",
      remark: "演示数据，仅用于体验页面和交互。",
      assets: [
        {
          id: "demo_asset_cmb",
          platform: "招商银行",
          customPlatform: "",
          amount: 100000,
          remark: "活期与理财示例"
        },
        {
          id: "demo_asset_fund",
          platform: "基金账户",
          customPlatform: "",
          amount: 68000,
          remark: "指数基金示例"
        }
      ],
      loans: [
        {
          id: "demo_loan_house",
          name: "房贷",
          lender: "招商银行",
          principal: 800000,
          remainingPrincipal: 600000,
          interestRate: 3.85,
          monthlyPayment: 5000,
          remark: "演示贷款"
        }
      ],
      cards: [
        {
          id: "demo_card_cmb",
          bankName: "招商银行",
          totalLimit: 50000,
          remainingLimit: 30000,
          remark: "演示信用卡"
        }
      ]
    },
    {
      id: "demo_snapshot_20260327",
      recordDate: "2026-03-27",
      title: "2026-03-27 资产快照",
      remark: "上月演示快照。",
      assets: [
        {
          id: "demo_asset_cmb",
          platform: "招商银行",
          customPlatform: "",
          amount: 92000,
          remark: ""
        },
        {
          id: "demo_asset_fund",
          platform: "基金账户",
          customPlatform: "",
          amount: 64000,
          remark: ""
        }
      ],
      loans: [
        {
          id: "demo_loan_house",
          name: "房贷",
          lender: "招商银行",
          principal: 800000,
          remainingPrincipal: 605000,
          interestRate: 3.85,
          monthlyPayment: 5000,
          remark: ""
        }
      ],
      cards: [
        {
          id: "demo_card_cmb",
          bankName: "招商银行",
          totalLimit: 50000,
          remainingLimit: 28000,
          remark: ""
        }
      ]
    }
  ];
}
