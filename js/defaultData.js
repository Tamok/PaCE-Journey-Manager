// defaultData.js
// Complete default journey data based on the given spreadsheet.
// Numeric priorities => "Critical" with priorityNumber.
// "Important", "Next", "Sometime Maybe" => top-level journeys.
// Subjourneys (child of X) => stored in parent’s subJourneys array.

const defaultJourneyData = [
  {
    id: "proj_management_1",
    title: "Project Management",
    priority: "Critical",
    priorityNumber: 1,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "child_life_3",
    title: "Child Life",
    priority: "Critical",
    priorityNumber: 3,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "intl_programs_4",
    title: "International Programs",
    priority: "Critical",
    priorityNumber: 4,
    difficulty: "hard",
    note: "account for potential differentiation, see child elements",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: [
      {
        id: "new_student_info",
        title: "New Student Info",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "customized_programs_1",
        title: "Customized Programs",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "customized_programs_2",
        title: "Customized Programs",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "visiting_scholars",
        title: "Visiting Scholars & Executives",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "international_students",
        title: "International Students",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "international_diploma",
        title: "International Diploma Program",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "international_housing",
        title: "International Student Housing",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "university_immersion",
        title: "University Immersion Program",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "optional_practical_training",
        title: "Optional Practical Training (Help Center)",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "step_upp_pathway",
        title: "Step UPP: Undergraduate Pathway Program",
        difficulty: "hard",
        note: "child of International Programs"
      },
      {
        id: "three_plus_one",
        title: "3+1",
        difficulty: "hard",
        note: "child of International Programs"
      }
    ]
  },
  {
    id: "paralegal_5",
    title: "Paralegal Studies",
    priority: "Critical",
    priorityNumber: 5,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "accounting_finance",
    title: "Accounting & Finance",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "medium",
    note: "account for potential differentiation, see elements",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: [
      {
        id: "business_accounting",
        title: "Business Accounting",
        difficulty: "medium",
        note: "child of Accounting & Finance"
      },
      {
        id: "professional_accounting",
        title: "Professional Accounting",
        difficulty: "medium",
        note: "child of Accounting & Finance"
      },
      {
        id: "cpa_licensure_prep",
        title: "CPA Licensure Prep Summer Program",
        difficulty: "medium",
        note: "child of Accounting & Finance"
      },
      {
        id: "strategic_investments",
        title: "Strategic Investments",
        difficulty: "medium",
        note: "child of Accounting & Finance"
      }
    ]
  },
  {
    id: "achieve",
    title: "Achieve",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we still doing that?",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "business_admin_mgmt",
    title: "Business Administration and Management",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "business_comm_law",
    title: "Business Communication & Law",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we still doing that? Difference with Paralegal?",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "business_leadership",
    title: "Business Leadership",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we still doing that? Difference with BAM",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "cleanroom_training",
    title: "Cleanroom Training",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "customer_experience_3rd",
    title: "Customer Experience (3rd party)",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "digital_marketing",
    title: "Digital Marketing",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "educational_partnerships",
    title: "Educational Partnerships",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "ev_tech_3rd",
    title: "EV Technician Training (3rd party)",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "exec_education_leadership",
    title: "Executive Education & Leadership",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "applied_behavior_analysis",
    title: "Applied Behavior Analysis",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "hard",
    note: "account for potential differentiation, see child elements",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: [
      {
        id: "bcba",
        title: "BCBA",
        difficulty: "hard",
        note: "child of Applied Behavior Analysis"
      },
      {
        id: "bcaba",
        title: "BCaBA",
        difficulty: "hard",
        note: "child of Applied Behavior Analysis"
      },
      {
        id: "qba",
        title: "QBA",
        difficulty: "hard",
        note: "child of Applied Behavior Analysis"
      },
      {
        id: "qasp_s",
        title: "QASP-S",
        difficulty: "hard",
        note: "child of Applied Behavior Analysis"
      },
      {
        id: "behavior_supports_systems",
        title: "Behavior Supports & Systems",
        difficulty: "hard",
        note: "child of Applied Behavior Analysis"
      }
    ]
  },
  {
    id: "emergency_med_tech",
    title: "Emergency Medical Technician",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "digital_tech",
    title: "Digital Technology",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "combine as one with Python and WebDev journeys",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "blockchain_3rd",
    title: "Blockchain (3rd Party)",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we still doing that?",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "human_resource_mgmt",
    title: "Human Resource Management",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "infrared_programs",
    title: "Infrared Programs",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "medium",
    note: "account for potential differentiation, see child elements",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: [
      {
        id: "intro_infrared_imaging",
        title: "Introduction to Infrared Imaging Technology",
        difficulty: "medium",
        note: "child of Infrared Programs"
      },
      {
        id: "modern_infrared_detectors",
        title: "Modern Infrared Detectors & Systems Applications",
        difficulty: "medium",
        note: "child of Infrared Programs"
      },
      {
        id: "free_ir_course_trailers",
        title: "FREE IR Course Trailers",
        difficulty: "medium",
        note: "child of Infrared Programs"
      }
    ]
  },
  {
    id: "intro_global_business",
    title: "Introduction to Global Business",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "open_university",
    title: "Open University",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "organizational_partnerships",
    title: "Organizational Partnerships",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "professional_career_advising",
    title: "Professional Career Advising",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we still doing that?",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "technology_mgmt",
    title: "Technology Management",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "uc_degree_completion",
    title: "UC Degree Completion Program",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "women_in_leadership_3rd",
    title: "Women in Leadership (3rd party)",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "but are we doing 3rd parties?",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "end_of_life_generic",
    title: "End of life generic - last extreme attempt $100",
    priority: "Important",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "lead_nurture",
    title: "Lead Nurture",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "welcome_aw",
    title: "Welcome (AW)",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "re_engagement_empty_cart",
    title: "Re-Engagement (emtpy cart)",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "nurture_tracks",
    title: "Nurture Tracks",
    priority: "Sometime Maybe",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "current_student",
    title: "Current Student",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  },
  {
    id: "post_purchase_journey",
    title: "Post-purchase journey",
    priority: "Next",
    priorityNumber: undefined,
    difficulty: "easy",
    note: "",
    podioLink: "",
    zohoLink: "",
    completedDate: null,
    startDate: null,
    endDate: null,
    subJourneys: []
  }
];

console.log("Default journey data loaded (full spreadsheet).");
export { defaultJourneyData };
