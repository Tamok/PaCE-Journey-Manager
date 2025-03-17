/* data.js */

/*
  1. Holiday Ranges with Names (2025–2027), for tooltips
*/
const holidayRanges = [
    // 2025
    { start: "2024-12-14", end: "2025-01-06", name: "Winter Break" },
    { start: "2024-12-31", end: "2025-01-01", name: "New Year" },
    { start: "2025-01-20", end: "2025-01-20", name: "MLK Day" },
    { start: "2025-02-17", end: "2025-02-17", name: "Presidents Day" },
    { start: "2025-03-31", end: "2025-03-31", name: "Cesar Chavez Day" },
    { start: "2025-05-26", end: "2025-05-30", name: "Spring Break + Memorial Day" },
    { start: "2025-06-19", end: "2025-06-19", name: "Juneteenth" },
    { start: "2025-07-04", end: "2025-07-04", name: "Independence Day" },
    { start: "2025-09-01", end: "2025-09-01", name: "Labor Day" },
    { start: "2025-11-27", end: "2025-11-28", name: "Thanksgiving" },
    { start: "2025-12-25", end: "2025-12-25", name: "Christmas" },
  
    // 2026
    { start: "2025-12-14", end: "2026-01-05", name: "Winter Break" },
    { start: "2026-01-19", end: "2026-01-19", name: "MLK Day" },
    { start: "2026-02-16", end: "2026-02-16", name: "Presidents Day" },
    { start: "2026-03-21", end: "2026-03-29", name: "Spring Break" },
    { start: "2026-03-31", end: "2026-03-31", name: "Cesar Chavez Day" },
    { start: "2026-05-25", end: "2026-05-25", name: "Memorial Day" },
    { start: "2026-06-19", end: "2026-06-19", name: "Juneteenth" },
    { start: "2026-07-04", end: "2026-07-04", name: "Independence Day" },
    { start: "2026-09-07", end: "2026-09-07", name: "Labor Day" },
    { start: "2026-11-26", end: "2026-11-27", name: "Thanksgiving" },
    { start: "2026-12-13", end: "2027-01-04", name: "Winter Break" },
    { start: "2026-12-25", end: "2026-12-25", name: "Christmas" },
  
    // 2027
    { start: "2027-01-18", end: "2027-01-18", name: "MLK Day" },
    { start: "2027-02-15", end: "2027-02-15", name: "Presidents Day" },
    { start: "2027-03-20", end: "2027-03-28", name: "Spring Break" },
    { start: "2027-03-31", end: "2027-03-31", name: "Cesar Chavez Day" },
    { start: "2027-05-31", end: "2027-05-31", name: "Memorial Day" },
    { start: "2027-06-19", end: "2027-06-19", name: "Juneteenth" },
    { start: "2027-07-04", end: "2027-07-04", name: "Independence Day" },
    { start: "2027-09-06", end: "2027-09-06", name: "Labor Day" },
    { start: "2027-11-25", end: "2027-11-26", name: "Thanksgiving" },
    { start: "2027-12-25", end: "2027-12-25", name: "Christmas" }
  ];
  
  /*
    2. Final Journey Data
    - Numbered items => "Priority" + "priorityNumber"
    - If there's a named priority (Important, Next, Sometime Maybe), use that.
    - If it's a subjourney (no priority in your table), we set "priority" = "Child".
    - Remove "child of above" notes and "↪" from titles.
  */
  let journeyData = [
    // Priority #1 => Project Management
    {
      title: "Project Management",
      priority: "Priority",
      priorityNumber: 1,
      difficulty: "easy",
      note: "",
      podioLink: "",
      zohoLink: ""
    },
    // Priority #3 => Child Life
    {
      title: "Child Life",
      priority: "Priority",
      priorityNumber: 3,
      difficulty: "easy",
      note: ""
    },
    // Priority #4 => International Programs
    {
      title: "International Programs",
      priority: "Priority",
      priorityNumber: 4,
      difficulty: "hard",
      note: ""
    },
    // Priority #5 => Paralegal Studies
    {
      title: "Paralegal Studies",
      priority: "Priority",
      priorityNumber: 5,
      difficulty: "easy",
      note: ""
    },
  
    // Next => "Accounting & Finance"
    {
      title: "Accounting & Finance",
      priority: "Next",
      difficulty: "medium",
      note: "account for potential differentiation, see elements"
    },
    // child => "Business Accounting" (no priority)
    {
      title: "Business Accounting",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
    {
      title: "Professional Accounting",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
    {
      title: "CPA Licensure Prep Summer Program",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
    {
      title: "Strategic Investments",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
  
    // Sometime Maybe => "Achieve"
    {
      title: "Achieve",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: "but are we still doing that?"
    },
  
    // Important => "Business Administration and Management"
    {
      title: "Business Administration and Management",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
  
    // Next => "Business Communication & Law", "Business Leadership", "Cleanroom Training", "Digital Marketing"
    {
      title: "Business Communication & Law",
      priority: "Next",
      difficulty: "easy",
      note: "but are we still doing that? Difference with Paralegal?"
    },
    {
      title: "Business Leadership",
      priority: "Next",
      difficulty: "easy",
      note: "but are we still doing that? Difference with BAM"
    },
    {
      title: "Cleanroom Training",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Customer Experience (3rd party)",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Digital Marketing",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Educational Partnerships",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    {
      title: "EV Technician Training (3rd party)",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Executive Education & Leadership",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
  
    // Important => "Applied Behavior Analysis" (hard)
    {
      title: "Applied Behavior Analysis",
      priority: "Important",
      difficulty: "hard",
      note: "account for potential differentiation"
    },
    // subjourneys => no priority
    {
      title: "BCBA",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "BCaBA",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "QBA",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "QASP-S",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Behavior Supports & Systems",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
  
    // Important => "Emergency Medical Technician"
    {
      title: "Emergency Medical Technician",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
  
    // Next => "Digital Technology"
    {
      title: "Digital Technology",
      priority: "Next",
      difficulty: "easy",
      note: "combine as one with Python and WebDev journeys"
    },
  
    // Sometime Maybe => "Blockchain (3rd Party)"
    {
      title: "Blockchain (3rd Party)",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: "but are we still doing that?"
    },
  
    // Important => "Human Resource Management"
    {
      title: "Human Resource Management",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
  
    // Important => "Infrared Programs"
    {
      title: "Infrared Programs",
      priority: "Important",
      difficulty: "medium",
      note: "account for potential differentiation"
    },
    {
      title: "Introduction to Infrared Imaging Technology",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
    {
      title: "Modern Infrared Detectors & Systems Applications",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
    {
      title: "FREE IR Course Trailers",
      priority: "Child",
      difficulty: "medium",
      note: ""
    },
  
    // Priority #4 => "International Programs" (already above)
  
    {
      title: "New Student Info",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Customized Programs",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Customized Programs",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Visiting Scholars & Executives",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "International Students",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "International Diploma Program",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "International Student Housing",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "University Immersion Program",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Optional Practical Training (Help Center)",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "Step UPP: Undergraduate Pathway Program",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
    {
      title: "3+1",
      priority: "Child",
      difficulty: "hard",
      note: ""
    },
  
    // Important => "Introduction to Global Business", "Open University"
    {
      title: "Introduction to Global Business",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Open University",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
  
    // Sometime Maybe => "Organizational Partnerships"
    {
      title: "Organizational Partnerships",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
  
    // Sometime Maybe => "Professional Career Advising"
    {
      title: "Professional Career Advising",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: "but are we still doing that?"
    },
  
    // Sometime Maybe => "Technology Management"
    {
      title: "Technology Management",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    // Sometime Maybe => "UC Degree Completion Program"
    {
      title: "UC Degree Completion Program",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    // Sometime Maybe => "Women in Leadership (3rd party)"
    {
      title: "Women in Leadership (3rd party)",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: "but are we doing 3rd parties?"
    },
  
    // Important => "End of life generic - last extreme attempt $100"
    {
      title: "End of life generic - last extreme attempt $100",
      priority: "Important",
      difficulty: "easy",
      note: ""
    },
  
    // Next => "Lead Nurture", "Welcome (AW)", "Re-Engagement (emtpy cart)", "Current Student", "Post-purchase journey"
    {
      title: "Lead Nurture",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Welcome (AW)",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Re-Engagement (emtpy cart)",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Nurture Tracks",
      priority: "Sometime Maybe",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Current Student",
      priority: "Next",
      difficulty: "easy",
      note: ""
    },
    {
      title: "Post-purchase journey",
      priority: "Next",
      difficulty: "easy",
      note: ""
    }
  ];
  
  /*
    3. Base 4-Week Plan Tasks for an "easy" journey,
       then we expand to 6 weeks for "medium", 8 for "hard."
       Each task row includes startWeek and endWeek (1-based).
  */
  const baseTaskRows = [
    // Week 1: Kent's tasks
    {
      name: "Diagram Building",
      startWeek: 1,
      endWeek: 1,
      dependencies: [],
      isApproval: false
    },
    {
      name: "Content Creation",
      startWeek: 1,
      endWeek: 1,
      dependencies: [],
      isApproval: false
    },
    {
      name: "Creative Development",
      startWeek: 1,
      endWeek: 1,
      dependencies: [],
      isApproval: false
    },
    {
      name: "Initial Email Template (Zoho)",
      startWeek: 1,
      endWeek: 1,
      dependencies: ["Creative Development"],
      isApproval: false
    },
    // Approvals (Week 2–3)
    {
      name: "PM Approval",
      startWeek: 2,
      endWeek: 2,
      dependencies: [],
      isApproval: true
    },
    {
      name: "Sheetal Approval",
      startWeek: 2,
      endWeek: 2,
      dependencies: ["PM Approval"],
      isApproval: true
    },
    {
      name: "Paolo Approval",
      startWeek: 3,
      endWeek: 3,
      dependencies: ["Sheetal Approval"],
      isApproval: true
    },
    {
      name: "Denis Approval",
      startWeek: 3,
      endWeek: 3,
      dependencies: ["Paolo Approval"],
      isApproval: true
    },
    // J's tasks that can overlap
    {
      name: "Zoho Workflow Building (Diagram)",
      startWeek: 2,
      endWeek: 2,
      dependencies: ["Diagram Building", "PM Approval"],
      isApproval: false
    },
    {
      name: "Email Template Revision (Zoho)",
      startWeek: 3,
      endWeek: 3,
      dependencies: ["Creative Development", "Paolo Approval", "Denis Approval"],
      isApproval: false
    },
    {
      name: "Workflow Linking / Logic",
      startWeek: 3,
      endWeek: 3,
      dependencies: ["Email Template Revision"],
      isApproval: false
    },
    // Week 4
    {
      name: "Final Template Revision",
      startWeek: 4,
      endWeek: 4,
      dependencies: ["Denis Approval"],
      isApproval: false
    },
    {
      name: "Project Wrap-Up & Check-In",
      startWeek: 4,
      endWeek: 4,
      dependencies: [],
      isApproval: false
    }
  ];
  
  