/**
 * defaultData.js
 *
 * Complete default journey data for PaCE Journey Manager.
 *
 * Main journeys use the standard priorities (Critical, Important, Next, Sometime Maybe)
 * and have their own difficulty values. All subjourneys (child journeys) are nested
 * inside a parent's subJourneys array. For every subjourney, the difficulty is set to "Easy"
 * and the priority is set to "Next". This indicates that they are subordinate to a main journey.
 *
 * This file is used to initialize the Firestore database if no journey data is present.
 */

const defaultJourneyData = [
  {
    id: "proj_management_1",
    title: "Project Management",
    priority: "Critical",
    priorityNumber: 1,
    difficulty: "Easy",
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
    difficulty: "Easy",
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
    difficulty: "Hard",
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
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "customized_programs_1",
        title: "Customized Programs",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "customized_programs_2",
        title: "Customized Programs",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "visiting_scholars",
        title: "Visiting Scholars & Executives",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "international_students",
        title: "International Students",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "international_diploma",
        title: "International Diploma Program",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "international_housing",
        title: "International Student Housing",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "university_immersion",
        title: "University Immersion Program",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "optional_practical_training",
        title: "Optional Practical Training (Help Center)",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "step_upp_pathway",
        title: "Step UPP: Undergraduate Pathway Program",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "three_plus_one",
        title: "3+1",
        difficulty: "Easy",
        priority: "Next",
        note: "child of International Programs",
        podioLink: "",
        zohoLink: ""
      }
    ]
  },
  {
    id: "paralegal_5",
    title: "Paralegal Studies",
    priority: "Critical",
    priorityNumber: 5,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Medium",
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
        difficulty: "Easy",
        priority: "Next",
        note: "child of Accounting & Finance",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "professional_accounting",
        title: "Professional Accounting",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Accounting & Finance",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "cpa_licensure_prep",
        title: "CPA Licensure Prep Summer Program",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Accounting & Finance",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "strategic_investments",
        title: "Strategic Investments",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Accounting & Finance",
        podioLink: "",
        zohoLink: ""
      }
    ]
  },
  {
    id: "achieve",
    title: "Achieve",
    priority: "Sometime Maybe",
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Hard",
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
        difficulty: "Easy",
        priority: "Next",
        note: "child of Applied Behavior Analysis",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "bcaba",
        title: "BCaBA",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Applied Behavior Analysis",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "qba",
        title: "QBA",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Applied Behavior Analysis",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "qasp_s",
        title: "QASP-S",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Applied Behavior Analysis",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "behavior_supports_systems",
        title: "Behavior Supports & Systems",
        difficulty: "Easy",
        priority: "Next",
        note: "child of Applied Behavior Analysis",
        podioLink: "",
        zohoLink: ""
      }
    ]
  },
  {
    id: "emergency_med_tech",
    title: "Emergency Medical Technician",
    priority: "Important",
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Medium",
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
        difficulty: "Medium",
        priority: "Next",
        note: "child of Infrared Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "modern_infrared_detectors",
        title: "Modern Infrared Detectors & Systems Applications",
        difficulty: "Medium",
        priority: "Next",
        note: "child of Infrared Programs",
        podioLink: "",
        zohoLink: ""
      },
      {
        id: "free_ir_course_trailers",
        title: "FREE IR Course Trailers",
        difficulty: "Medium",
        priority: "Next",
        note: "child of Infrared Programs",
        podioLink: "",
        zohoLink: ""
      }
    ]
  },
  {
    id: "intro_global_business",
    title: "Introduction to Global Business",
    priority: "Important",
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
    priorityNumber: null,
    difficulty: "Easy",
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
