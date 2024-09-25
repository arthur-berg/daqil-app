import { useTranslations } from "next-intl";

export const useGetCountries = () => {
  const t = useTranslations("Countries");

  const countries = [
    // Popular Countries
    { value: "US", label: t("US") },
    { value: "AE", label: t("AE") },
    { value: "GB", label: t("GB") },
    { value: "FR", label: t("FR") },
    { value: "DE", label: t("DE") },
    { value: "IN", label: t("IN") },
    { value: "CN", label: t("CN") },
    { value: "JP", label: t("JP") },
    { value: "CA", label: t("CA") },
    { value: "BR", label: t("BR") },
    { value: "ZA", label: t("ZA") },
    { value: "AU", label: t("AU") },

    // Full List of Countries
    { value: "AF", label: t("AF") }, // Afghanistan
    { value: "AL", label: t("AL") }, // Albania
    { value: "DZ", label: t("DZ") }, // Algeria
    { value: "AD", label: t("AD") }, // Andorra
    { value: "AO", label: t("AO") }, // Angola
    { value: "AR", label: t("AR") }, // Argentina
    { value: "AM", label: t("AM") }, // Armenia
    { value: "AT", label: t("AT") }, // Austria
    { value: "AZ", label: t("AZ") }, // Azerbaijan
    { value: "BD", label: t("BD") }, // Bangladesh
    { value: "BE", label: t("BE") }, // Belgium
    { value: "BJ", label: t("BJ") }, // Benin
    { value: "BT", label: t("BT") }, // Bhutan
    { value: "BO", label: t("BO") }, // Bolivia
    { value: "BA", label: t("BA") }, // Bosnia and Herzegovina
    { value: "BW", label: t("BW") }, // Botswana
    { value: "BN", label: t("BN") }, // Brunei
    { value: "BG", label: t("BG") }, // Bulgaria
    { value: "BF", label: t("BF") }, // Burkina Faso
    { value: "KH", label: t("KH") }, // Cambodia
    { value: "CM", label: t("CM") }, // Cameroon
    { value: "CL", label: t("CL") }, // Chile
    { value: "CO", label: t("CO") }, // Colombia
    { value: "CR", label: t("CR") }, // Costa Rica
    { value: "HR", label: t("HR") }, // Croatia
    { value: "CU", label: t("CU") }, // Cuba
    { value: "CY", label: t("CY") }, // Cyprus
    { value: "CZ", label: t("CZ") }, // Czech Republic
    { value: "DK", label: t("DK") }, // Denmark
    { value: "DJ", label: t("DJ") }, // Djibouti
    { value: "DO", label: t("DO") }, // Dominican Republic
    { value: "EC", label: t("EC") }, // Ecuador
    { value: "EG", label: t("EG") }, // Egypt
    { value: "SV", label: t("SV") }, // El Salvador
    { value: "EE", label: t("EE") }, // Estonia
    { value: "ET", label: t("ET") }, // Ethiopia
    { value: "FI", label: t("FI") }, // Finland
    { value: "GR", label: t("GR") }, // Greece
    { value: "HK", label: t("HK") }, // Hong Kong
    { value: "IE", label: t("IE") }, // Ireland
    { value: "IL", label: t("IL") }, // Israel
    { value: "IT", label: t("IT") }, // Italy
    { value: "JM", label: t("JM") }, // Jamaica
    { value: "JO", label: t("JO") }, // Jordan
    { value: "KZ", label: t("KZ") }, // Kazakhstan
    { value: "KE", label: t("KE") }, // Kenya
    { value: "KW", label: t("KW") }, // Kuwait
    { value: "LV", label: t("LV") }, // Latvia
    { value: "LB", label: t("LB") }, // Lebanon
    { value: "LS", label: t("LS") }, // Lesotho
    { value: "LR", label: t("LR") }, // Liberia
    { value: "LY", label: t("LY") }, // Libya
    { value: "LI", label: t("LI") }, // Liechtenstein
    { value: "LT", label: t("LT") }, // Lithuania
    { value: "LU", label: t("LU") }, // Luxembourg
    { value: "MG", label: t("MG") }, // Madagascar
    { value: "MW", label: t("MW") }, // Malawi
    { value: "MY", label: t("MY") }, // Malaysia
    { value: "ML", label: t("ML") }, // Mali
    { value: "MT", label: t("MT") }, // Malta
    { value: "MU", label: t("MU") }, // Mauritius
    { value: "MD", label: t("MD") }, // Moldova
    { value: "MC", label: t("MC") }, // Monaco
    { value: "MN", label: t("MN") }, // Mongolia
    { value: "MA", label: t("MA") }, // Morocco
    { value: "MZ", label: t("MZ") }, // Mozambique
    { value: "NA", label: t("NA") }, // Namibia
    { value: "NP", label: t("NP") }, // Nepal
    { value: "NL", label: t("NL") }, // Netherlands
    { value: "NZ", label: t("NZ") }, // New Zealand
    { value: "NG", label: t("NG") }, // Nigeria
    { value: "NO", label: t("NO") }, // Norway
    { value: "OM", label: t("OM") }, // Oman
    { value: "PK", label: t("PK") }, // Pakistan
    { value: "PA", label: t("PA") }, // Panama
    { value: "PG", label: t("PG") }, // Papua New Guinea
    { value: "PE", label: t("PE") }, // Peru
    { value: "PH", label: t("PH") }, // Philippines
    { value: "PL", label: t("PL") }, // Poland
    { value: "PT", label: t("PT") }, // Portugal
    { value: "QA", label: t("QA") }, // Qatar
    { value: "RO", label: t("RO") }, // Romania
    { value: "RU", label: t("RU") }, // Russia
    { value: "SA", label: t("SA") }, // Saudi Arabia
    { value: "SG", label: t("SG") }, // Singapore
    { value: "SK", label: t("SK") }, // Slovakia
    { value: "SI", label: t("SI") }, // Slovenia
    { value: "KR", label: t("KR") }, // South Korea
    { value: "ES", label: t("ES") }, // Spain
    { value: "SE", label: t("SE") }, // Sweden
    { value: "CH", label: t("CH") }, // Switzerland
    { value: "TH", label: t("TH") }, // Thailand
    { value: "TR", label: t("TR") }, // Turkey
    { value: "UG", label: t("UG") }, // Uganda
    { value: "UA", label: t("UA") }, // Ukraine
    { value: "UY", label: t("UY") }, // Uruguay
    { value: "UZ", label: t("UZ") }, // Uzbekistan
    { value: "VE", label: t("VE") }, // Venezuela
    { value: "VN", label: t("VN") }, // Vietnam
    { value: "ZM", label: t("ZM") }, // Zambia
    { value: "ZW", label: t("ZW") }, // Zimbabwe
  ];

  return countries;
};
