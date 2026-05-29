/**
 * Sunday Estate — single source of truth for company profile.
 * Ported from sunday-estate-webapp/prototype/src/data.jsx::COMPANY_PROFILE.
 *
 * If facts here drift from the webapp constant, the webapp is canonical (it
 * ships the legal/e-GP forms). Update both, do not let them diverge silently.
 */

export const COMPANY = {
  nameTh: "บริษัท ซันเดย์ เอสเตท จำกัด",
  nameEn: "SUNDAY ESTATE CO., LTD.",
  taxId: "0105568042151",
  registered: "2025-02-24", // พ.ศ. 2568
  egp: "M2569012964",
  capital: 1_000_000,
  paidUp: 250_000,
  shares: { count: 10_000, value: 100 },
  address: {
    th: "21 ซอยสังคมสงเคราะห์ 30 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230",
    en: "21 Soi Sangkhomsongkhro 30, Lat Phrao, Bangkok 10230, Thailand",
  },
  phone: "099-265-4265",
  email: "aase7en@sunday-estate.com",
  bank: { name: "Kasikornbank", account: "205-8-40036-9", type: "Savings" },
  appUrl: "https://app.sundayestate.co.th",
} as const;

/**
 * 3 service pillars — short copy used on home page Services section.
 * Long copy + 32 detailed objectives live in messages/{th,en}.json (M2).
 */
export const SERVICES = [
  {
    id: "land",
    titleTh: "ที่ดินและจัดสรร",
    titleEn: "Land & Subdivision",
    descTh:
      "ซื้อ ขาย จัดสรร และพัฒนาที่ดินสำหรับโครงการที่อยู่อาศัย พาณิชยกรรม และอุตสาหกรรม",
    descEn:
      "Buy, sell, subdivide & develop land for residential, commercial, and industrial projects.",
    icon: "land",
  },
  {
    id: "asset",
    titleTh: "บริหารทรัพย์สินและสัญญา",
    titleEn: "Asset & Contract Management",
    descTh:
      "บริหารสัญญา ขายฝาก จำนอง โฉนด และพอร์ตทรัพย์สิน — ครบจบในระบบเดียว",
    descEn:
      "Manage contracts, sale-with-right-of-redemption, mortgages, deeds & portfolio — all in one workspace.",
    icon: "asset",
  },
  {
    id: "egp",
    titleTh: "e-GP และภาครัฐ",
    titleEn: "e-GP & Government",
    descTh:
      "จดทะเบียน e-GP ครอบคลุม 7 หมวด: ที่ดิน ก่อสร้าง จ้างเหมา เช่า ที่ปรึกษา ออกแบบ ควบคุมงาน",
    descEn:
      "e-GP registered across 7 categories: land, construction, hire, lease, consulting, design, supervision.",
    icon: "gov",
  },
] as const;
