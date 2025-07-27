const mongoose = require('mongoose');
const connectDB = require('./db');
const VisaRule = require('./models/VisaRules');
const CountryInfo = require('./models/CountryInfo');

const data = {
  uk_visa_rules: {
    skilled_worker_visa: {
      eligibility: {
        job_offer: "Required from UK employer with valid sponsor licence",
        certificate_of_sponsorship: "Required and must be for an eligible occupation",
        salary_threshold: "Minimum £26,200 per year or 'going rate' for the occupation",
        points_required: 70,
        english_language: "Must prove proficiency (e.g. approved test)",
        maintenance_funds: "Show savings or meet exemptions (e.g. already in UK for 12 months)",
        tuberculosis_test: "Required if resident in a listed country for >6 months"
      },
      documents_required: [
        "Valid passport or travel document",
        "Certificate of Sponsorship",
        "Proof of English language ability",
        "Proof of maintenance funds (unless exempt)",
        "TB test certificate (if applicable)"
      ],
      fees: {
        application_fee: {
          inside_uk: "£704",
          outside_uk: "£610"
        },
        health_surcharge: "£624 per year",
        dependant_fee: "Varies, usually 75% of main applicant fee"
      },
      processing_times: {
        inside_uk: "Usually up to 8 weeks",
        outside_uk: "Usually up to 3 weeks"
      },
      exceptions: [
        "Lower salary threshold for new entrants and shortage occupation list jobs",
        "Exempt from maintenance funds if sponsor certifies maintenance",
        "Health surcharge waived for certain healthcare workers"
      ]
    },

    family_visa_partner_spouse: {
      eligibility: {
        relationship: "Spouse, civil partner, fiancé(e), unmarried partner or child",
        sponsor_income_threshold: "At least £29,000 annual gross income (may be increasing)",
        english_language: "Prove basic English knowledge",
        genuine_relationship: "Must provide evidence of relationship",
        maintenance_funds: "Must show funds to support yourself if no income",
        tuberculosis_test: "Required if from listed countries"
      },
      documents_required: [
        "Passport",
        "Proof of relationship",
        "Proof of sponsor's income",
        "Proof of English language ability",
        "TB test certificate (if applicable)"
      ],
      fees: {
        application_fee: {
          inside_uk: "£1,048",
          outside_uk: "£1,538"
        },
        health_surcharge: "£624 per year",
        dependant_fee: "Same as main applicant"
      },
      processing_times: {
        inside_uk: "Usually up to 8 weeks",
        outside_uk: "Usually up to 12 weeks"
      },
      exceptions: [
        "Income threshold may be reduced for disabled sponsors or children with disabilities",
        "Applicants under 18 may have reduced fees and requirements",
        "English language requirements may be waived for some"
      ]
    },

    high_potential_individual_visa: {
      eligibility: {
        degree: "Must have a degree from an eligible university in past 5 years",
        english_language: "Must meet English language requirement",
        maintenance_funds: "Show savings unless in UK on valid visa for 12 months",
        job_offer: "Not required"
      },
      documents_required: [
        "Passport",
        "Degree certificate",
        "Proof of English language ability",
        "Proof of maintenance funds (if applicable)"
      ],
      fees: {
        application_fee: {
          inside_uk: "£715",
          outside_uk: "£715"
        },
        health_surcharge: "£624 per year",
        dependant_fee: "Same as main applicant"
      },
      processing_times: {
        inside_uk: "Usually up to 8 weeks",
        outside_uk: "Usually up to 3 weeks"
      },
      exceptions: [
        "Maintenance funds not required if applicant has been in UK on valid visa for 12 months",
        "No job offer or sponsorship required"
      ]
    },

    standard_visitor_visa: {
      eligibility: {
        purpose: "Tourism, visiting family/friends, business, short-term studies",
        intent_to_leave: "Must intend to leave UK after visit",
        funds: "Sufficient funds for stay and travel",
        tuberculosis_test: "Required if visit >6 months and from listed countries"
      },
      documents_required: [
        "Passport",
        "Evidence of travel plans",
        "Proof of funds",
        "TB test certificate (if applicable)"
      ],
      fees: {
        application_fee: {
          standard_duration: "£100"
        },
        health_surcharge: "Not required"
      },
      processing_times: {
        standard: "Usually up to 3 weeks"
      },
      exceptions: [
        "Longer stays (over 6 months) require TB test and additional evidence",
        "Some nationals may have different fee structures or exemptions"
      ]
    },
  },

    visa_free_countries: [
      "Andorra", "Antigua and Barbuda", "Australia", "Bahamas", "Barbados",
      "Belgium", "Canada", "Chile", "Croatia", "Cyprus", "Czech Republic",
      "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
      "Hungary", "Iceland", "Ireland", "Italy", "Japan", "Latvia",
      "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco",
      "Netherlands", "New Zealand", "Norway", "Poland", "Portugal",
      "San Marino", "Singapore", "Slovakia", "Slovenia", "South Korea",
      "Spain", "Sweden", "Switzerland", "United States"
    ],

    visa_required_countries: [
      "Afghanistan", "Albania", "Algeria", "Angola", "Bangladesh", "Belarus",
      "Burundi", "Cameroon", "China (People’s Republic of)", "Colombia",
      "Congo", "Congo Dem. Republic", "Cyprus (northern part)", "Dominica",
      "Egypt", "El Salvador", "Eritrea", "Eswatini (Swaziland)", "Ethiopia",
      "Gambia", "Georgia", "Ghana", "Guinea", "Guinea-Bissau", "Honduras",
      "India", "Iran", "Iraq", "Ivory Coast", "Jamaica", "Jordan", "Kenya",
      "Kosovo", "Lebanon", "Lesotho", "Liberia", "Libya", "Malawi",
      "Moldova", "Mongolia", "Myanmar (Burma)", "Namibia", "Nepal",
      "Nigeria", "North Macedonia", "Pakistan", "Palestinian Territories",
      "Russia", "Rwanda", "Senegal", "Serbia", "Sierra Leone", "Somalia",
      "South Africa", "South Sudan", "Sri Lanka", "Sudan", "Syria",
      "Tanzania", "Timor-Leste", "Trinidad and Tobago", "Turkey",
      "Uganda", "Venezuela (non biometric)", "Vanuatu", "Vietnam", "Yemen",
      "Zimbabwe"
    ],

    tb_test_countries: [
      "Afghanistan", "Angola", "Bangladesh", "Botswana", "Brazil",
      "Cambodia", "Cameroon", "Central African Republic", "China",
      "Democratic Republic of Congo", "Eritrea", "Ethiopia", "Gabon",
      "Ghana", "Guinea", "India", "Indonesia", "Kenya", "Lesotho",
      "Liberia", "Malawi", "Mozambique", "Myanmar", "Namibia", "Nepal",
      "Nigeria", "Pakistan", "Papua New Guinea", "Philippines",
      "Republic of Congo", "Rwanda", "Sierra Leone", "Somalia",
      "South Africa", "South Sudan", "Sri Lanka", "Sudan", "Tanzania",
      "Thailand", "Togo", "Uganda", "Vietnam", "Zambia", "Zimbabwe"
    ],

    tb_test_explanation: "Tuberculosis (TB) test is a medical screening required for visa applicants who have lived for 6 months or more in certain countries with a high prevalence of TB. It is mandatory to demonstrate they do not have active tuberculosis before being granted a UK visa."

};

const seedDB = async () => {
  try {
    await connectDB();

    await VisaRule.deleteMany({});
    await CountryInfo.deleteMany({});

    const visaRules = Object.entries(data.uk_visa_rules).map(([key, value]) => ({
      visaType: key,
      eligibility: value.eligibility,
      documents_required: value.documents_required,
      fees: value.fees,
      processing_times: value.processing_times,
      exceptions: value.exceptions,
    }));

    await VisaRule.insertMany(visaRules);

    await CountryInfo.create({
      visaFreeCountries: data.visa_free_countries,
      visaRequiredCountries: data.visa_required_countries,
      tbTestCountries: data.tb_test_countries,
      tbTestExplanation: data.tb_test_explanation,
    });

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
