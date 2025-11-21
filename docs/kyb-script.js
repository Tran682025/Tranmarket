// kyb-script.js — language switcher + KYB JSON output

const i18n = {
  en: {
    pageTitle: "Business onboarding",
    pageSubtitle: "Fill this form to submit your KYB profile for Tranmarket.",
    sectionBusinessDetails: "Business details",
    sectionJurisdiction: "Jurisdiction",
    sectionContact: "Contact person",
    sectionServiceProfile: "Service profile",
    sectionCompliance: "Compliance and declarations",
    businessTypeLabel: "Business type",
    businessTypeIndividual: "Individual service provider",
    businessTypeCompany: "Registered company",
    businessTypeNonprofit: "Nonprofit or organization",
    selectPlaceholder: "Select…",
    legalNameLabel: "Legal name",
    tradingNameLabel: "Trading name (optional)",
    registrationNumberLabel: "Registration number (optional)",
    taxIdLabel: "Tax ID (optional)",
    countryLabel: "Country",
    stateRegionLabel: "State / region (optional)",
    cityLabel: "City",
    postalCodeLabel: "Postal code",
    addressLine1Label: "Address line 1",
    addressLine2Label: "Address line 2 (optional)",
    contactNameLabel: "Full name",
    contactRoleLabel: "Role",
    contactEmailLabel: "Email",
    contactPhoneLabel: "Phone number",
    websiteUrlLabel: "Website (optional)",
    preferredLanguageLabel: "Preferred language",
    langOther: "Other",
    mainCategoryLabel: "Main service category",
    subCategoriesLabel: "Subcategories (comma separated)",
    serviceCountriesLabel: "Service countries (ISO codes, comma separated)",
    onlineOnlyLabel: "Online only",
    physicalPresenceLabel: "Physical presence required",
    shortDescriptionLabel: "Short description",
    longDescriptionLabel: "Long description",
    isUBOLabel: "I confirm I am the ultimate beneficial owner or an authorized representative of this business.",
    hasLicensesLabel: "I confirm that I hold valid licenses where required for the services I provide.",
    acceptsPiOnlyLabel: "I agree to accept Pi payments only inside the Pi Network ecosystem on Tranmarket.",
    noIllegalUseLabel: "I agree not to use Tranmarket for illegal, restricted or prohibited activities.",
    agreesKycKybLabel: "I agree that my KYB information may be reviewed for MiCA and Pi Network compliance.",
    consoleHint: "Note: this prototype prints KYB data to console as JSON.",
    submitButton: "Submit KYB for review",
  },

  cs: {
    pageTitle: "Onboarding podnikání",
    pageSubtitle: "Vyplňte tento formulář pro zaslání KYB profilu pro Tranmarket.",
    sectionBusinessDetails: "Údaje o podnikání",
    sectionJurisdiction: "Jurisdikce",
    sectionContact: "Kontaktní osoba",
    sectionServiceProfile: "Profil služeb",
    sectionCompliance: "Soulad a prohlášení",
    businessTypeLabel: "Typ podnikání",
    businessTypeIndividual: "Osoba samostatně výdělečně činná",
    businessTypeCompany: "Registrovaná společnost",
    businessTypeNonprofit: "Nezisková organizace",
    selectPlaceholder: "Vyberte…",
    legalNameLabel: "Právní název",
    tradingNameLabel: "Obchodní název (volitelné)",
    registrationNumberLabel: "IČO / registrační číslo (volitelné)",
    taxIdLabel: "DIČ (volitelné)",
    countryLabel: "Stát",
    stateRegionLabel: "Kraj / region (volitelné)",
    cityLabel: "Město",
    postalCodeLabel: "PSČ",
    addressLine1Label: "Adresa – řádek 1",
    addressLine2Label: "Adresa – řádek 2 (volitelné)",
    contactNameLabel: "Jméno a příjmení",
    contactRoleLabel: "Funkce",
    contactEmailLabel: "E-mail",
    contactPhoneLabel: "Telefon",
    websiteUrlLabel: "Web (volitelné)",
    preferredLanguageLabel: "Preferovaný jazyk",
    langOther: "Jiný",
    mainCategoryLabel: "Hlavní kategorie služeb",
    subCategoriesLabel: "Podkategorie (oddělené čárkou)",
    serviceCountriesLabel: "Země poskytování služeb (ISO kódy, oddělené čárkou)",
    onlineOnlyLabel: "Pouze online",
    physicalPresenceLabel: "Vyžaduje fyzickou přítomnost",
    shortDescriptionLabel: "Stručný popis",
    longDescriptionLabel: "Podrobný popis",
    isUBOLabel: "Potvrzuji, že jsem vlastníkem nebo oprávněným zástupcem.",
    hasLicensesLabel: "Potvrzuji, že vlastním platná povolení k poskytované službě.",
    acceptsPiOnlyLabel: "Souhlasím s přijímáním plateb Pi pouze v ekosystému Pi Network.",
    noIllegalUseLabel: "Nebudu používat Tranmarket k nezákonným aktivitám.",
    agreesKycKybLabel: "Souhlasím s kontrolou KYB podle MiCA a Pi Network.",
    consoleHint: "Poznámka: tento prototyp vypíše KYB JSON do konzole.",
    submitButton: "Odeslat KYB ke kontrole",
  },

  vi: {
    pageTitle: "Onboarding doanh nghiệp",
    pageSubtitle: "Điền biểu mẫu để gửi hồ sơ KYB cho Tranmarket.",
    sectionBusinessDetails: "Thông tin doanh nghiệp",
    sectionJurisdiction: "Khu vực pháp lý",
    sectionContact: "Người liên hệ",
    sectionServiceProfile: "Hồ sơ dịch vụ",
    sectionCompliance: "Cam kết và tuân thủ",
    businessTypeLabel: "Loại hình kinh doanh",
    businessTypeIndividual: "Cá nhân cung cấp dịch vụ",
    businessTypeCompany: "Công ty đã đăng ký",
    businessTypeNonprofit: "Tổ chức phi lợi nhuận",
    selectPlaceholder: "Chọn…",
    legalNameLabel: "Tên pháp lý",
    tradingNameLabel: "Tên thương hiệu (không bắt buộc)",
    registrationNumberLabel: "Mã đăng ký (không bắt buộc)",
    taxIdLabel: "Mã số thuế (không bắt buộc)",
    countryLabel: "Quốc gia",
    stateRegionLabel: "Tỉnh / Bang (không bắt buộc)",
    cityLabel: "Thành phố",
    postalCodeLabel: "Mã bưu điện",
    addressLine1Label: "Địa chỉ dòng 1",
    addressLine2Label: "Địa chỉ dòng 2 (không bắt buộc)",
    contactNameLabel: "Họ tên",
    contactRoleLabel: "Chức vụ",
    contactEmailLabel: "Email",
    contactPhoneLabel: "Điện thoại",
    websiteUrlLabel: "Website (không bắt buộc)",
    preferredLanguageLabel: "Ngôn ngữ ưu tiên",
    langOther: "Khác",
    mainCategoryLabel: "Nhóm dịch vụ chính",
    subCategoriesLabel: "Nhóm dịch vụ phụ (dấu phẩy)",
    serviceCountriesLabel: "Các quốc gia phục vụ (mã ISO)",
    onlineOnlyLabel: "Chỉ online",
    physicalPresenceLabel: "Cần trực tiếp",
    shortDescriptionLabel: "Mô tả ngắn",
    longDescriptionLabel: "Mô tả chi tiết",
    isUBOLabel: "Tôi xác nhận là chủ sở hữu hợp pháp / đại diện doanh nghiệp.",
    hasLicensesLabel: "Tôi xác nhận có đầy đủ giấy phép cần thiết.",
    acceptsPiOnlyLabel: "Tôi chỉ nhận thanh toán bằng Pi trong hệ sinh thái Pi Network.",
    noIllegalUseLabel: "Tôi không sử dụng Tranmarket cho hoạt động trái phép.",
    agreesKycKybLabel: "Tôi đồng ý để KYB được kiểm tra theo MiCA và Pi Network.",
    consoleHint: "Lưu ý: bản demo chỉ in dữ liệu KYB dưới dạng JSON.",
    submitButton: "Gửi hồ sơ KYB",
  },
};

const DEFAULT_LANG = localStorage.getItem("tm_kyb_lang") || "en";

function applyTranslations(lang) {
  const dict = i18n[lang] || i18n.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("option[data-i18n]").forEach((opt) => {
    const key = opt.getAttribute("data-i18n");
    if (key && dict[key]) opt.textContent = dict[key];
  });
}

function setActiveLangButton(lang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations(DEFAULT_LANG);
  setActiveLangButton(DEFAULT_LANG);

  document.querySelectorAll(".lang-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (!i18n[lang]) return;
      localStorage.setItem("tm_kyb_lang", lang);
      applyTranslations(lang);
      setActiveLangButton(lang);
    })
  );

  document.getElementById("kyb-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const val = (id) => document.getElementById(id)?.value?.trim() || null;
    const yes = (id) => document.getElementById(id)?.checked || false;

    const payload = {
      businessType: val("businessType"),
      legalName: val("legalName"),
      tradingName: val("tradingName"),
      registrationNumber: val("registrationNumber"),
      taxId: val("taxId"),
      jurisdiction: {
        country: val("country"),
        stateRegion: val("stateRegion"),
        city: val("city"),
        postalCode: val("postalCode"),
        addressLine1: val("addressLine1"),
        addressLine2: val("addressLine2"),
      },
      contact: {
        name: val("contactName"),
        role: val("contactRole"),
        email: val("contactEmail"),
        phone: val("contactPhone"),
        website: val("websiteUrl"),
        preferredLanguage: val("preferredLanguage"),
      },
      service: {
        mainCategory: val("mainCategory"),
        subCategories: (val("subCategories") || "").split(",").map((s) => s.trim()).filter(Boolean),
        serviceCountries: (val("serviceCountries") || "").split(",").map((s) => s.trim()).filter(Boolean),
        onlineOnly: yes("onlineOnly"),
        physicalPresence: yes("physicalPresence"),
        shortDescription: val("shortDescription"),
        longDescription: val("longDescription"),
      },
      compliance: {
        isUBO: yes("isUBO"),
        hasLicenses: yes("hasLicenses"),
        acceptsPiOnly: yes("acceptsPiOnly"),
        noIllegalUse: yes("noIllegalUse"),
        agreesKycKyb: yes("agreesKycKyb"),
      },
      submittedAt: new Date().toISOString(),
    };

    console.log("Tranmarket KYB JSON:");
    console.log(JSON.stringify(payload, null, 2));
    alert("KYB captured — check console for JSON output.");
  });
});
