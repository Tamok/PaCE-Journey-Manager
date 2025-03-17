// data.js
// Parses the updated spreadsheet data (rawSheet) into a final array of journeys.
// Top-level journeys include a subJourneys array with their children.

const rawSheet = [
    ["Next", "Accounting & Finance", "medium (account for potential differentiation, see elements)"],
    ["", "Business Accounting", "child of Accounting & Finance"],
    ["", "Professional Accounting", "child of Accounting & Finance"],
    ["", "CPA Licensure Prep Summer Program", "child of Accounting & Finance"],
    ["", "Strategic Investments", "child of Accounting & Finance"],
    ["Sometime Maybe", "Achieve", "easy, but are we still doing that?"],
    ["Important", "Business Administration and Management", "easy"],
    ["Next", "Business Communication & Law", "easy, but are we still doing that? Difference with Paralegal?"],
    ["Next", "Business Leadership", "easy, but are we still doing that? Difference with BAM"],
    ["Next", "Cleanroom Training", "easy"],
    ["Sometime Maybe", "Customer Experience (3rd party)", "easy"],
    ["Next", "Digital Marketing", "easy"],
    ["Sometime Maybe", "Educational Partnerships", "easy"],
    ["Sometime Maybe", "EV Technician Training (3rd party)", "easy"],
    ["Sometime Maybe", "Executive Education & Leadership", "easy"],
    ["Important", "Applied Behavior Analysis", "hard (account for potential differentiation)"],
    ["", "BCBA", "child of Applied Behavior Analysis"],
    ["", "BCaBA", "child of Applied Behavior Analysis"],
    ["", "QBA", "child of Applied Behavior Analysis"],
    ["", "QASP-S", "child of Applied Behavior Analysis"],
    ["", "Behavior Supports & Systems", "child of Applied Behavior Analysis"],
    ["3", "Child Life", "easy"],
    ["Important", "Emergency Medical Technician", "easy"],
    ["Next", "Digital Technology", "easy (combine as one with Python and WebDev journeys)"],
    ["Sometime Maybe", "Blockchain (3rd Party)", "easy, but are we still doing that?"],
    ["Important", "Human Resource Management", "easy"],
    ["Important", "Infrared Programs", "medium (account for potential differentiation)"],
    ["", "Introduction to Infrared Imaging Technology", "child of Infrared Programs"],
    ["", "Modern Infrared Detectors & Systems Applications", "child of Infrared Programs"],
    ["", "FREE IR Course Trailers", "child of Infrared Programs"],
    ["4", "International Programs", "hard (account for potential differentiation)"],
    ["", "New Student Info", "child of International Programs"],
    ["", "Customized Programs", "child of International Programs"],
    ["", "Customized Programs", "child of International Programs"],
    ["", "Visiting Scholars & Executives", "child of International Programs"],
    ["", "International Students", "child of International Programs"],
    ["", "International Diploma Program", "child of International Programs"],
    ["", "International Student Housing", "child of International Programs"],
    ["", "University Immersion Program", "child of International Programs"],
    ["", "Optional Practical Training (Help Center)", "child of International Programs"],
    ["", "Step UPP: Undergraduate Pathway Program", "child of International Programs"],
    ["", "3+1", "child of International Programs"],
    ["Important", "Introduction to Global Business", "easy"],
    ["Important", "Open University", "easy"],
    ["Sometime Maybe", "Organizational Partnerships", "easy"],
    ["5", "Paralegal Studies", "easy"],
    ["Sometime Maybe", "Professional Career Advising", "easy, but are we still doing that?"],
    ["1", "Project Management", "easy"],
    ["Sometime Maybe", "Technology Management", "easy"],
    ["Sometime Maybe", "UC Degree Completion Program", "easy"],
    ["Sometime Maybe", "Women in Leadership (3rd party)", "easy, but are we doing 3rd parties?"],
    ["Important", "End of life generic - last extreme attempt $100", "easy"],
    ["Next", "Lead Nurture", "easy"],
    ["Next", "Welcome (AW)", "easy"],
    ["Next", "Re-Engagement (emtpy cart)", "easy"],
    ["Sometime Maybe", "Nurture Tracks", "easy"],
    ["Next", "Current Student", "easy"],
    ["Next", "Post-purchase journey", "easy"]
  ];
  
  /**
   * parseRawSheet():
   * - Iterates over rawSheet.
   * - For a row with a non-empty Priority cell, creates a top-level journey.
   *   If the Priority cell is numeric, interprets it as Critical with a priorityNumber.
   * - Rows with an empty Priority are attached as subjourneys to the last top-level journey.
   */
  function parseRawSheet() {
    const journeys = [];
    let lastParent = null;
    for (const row of rawSheet) {
      const [rawPriority, rawTitle, rawDiffNote] = row;
      const titleClean = rawTitle.replace(/^[↪\s]+/, "").trim();
      const isSub = rawPriority === "" || /child of/i.test(rawDiffNote);
      let priority = "";
      let priorityNumber = undefined;
      if (!isSub && rawPriority) {
        const num = parseInt(rawPriority, 10);
        if (!isNaN(num)) {
          priority = "Critical";
          priorityNumber = num;
        } else {
          priority = rawPriority === "Priority" ? "Critical" : rawPriority;
        }
      }
      let difficulty = "easy";
      if (/medium/i.test(rawDiffNote)) difficulty = "medium";
      if (/hard/i.test(rawDiffNote)) difficulty = "hard";
      let note = rawDiffNote.replace(/child of.*/i, "").replace(/see [↪]+elements/i, "").trim();
  
      if (isSub) {
        if (lastParent) {
          lastParent.subJourneys.push({
            id: Date.now() + Math.random(),
            title: titleClean,
            difficulty,
            note
          });
        }
      } else {
        const newJourney = {
          id: Date.now() + Math.random(),
          title: titleClean,
          priority,
          priorityNumber: (priority === "Critical") ? priorityNumber : undefined,
          difficulty,
          note,
          podioLink: "",
          zohoLink: "",
          subJourneys: []
        };
        journeys.push(newJourney);
        lastParent = newJourney;
      }
    }
    return journeys;
  }
  
  let journeyData = parseRawSheet();
  console.log("Parsed journeyData:", journeyData);
  