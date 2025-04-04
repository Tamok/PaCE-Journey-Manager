// src/services/taskTemplates.js
// Task Templates with fractional increments (0.5 week increments)
// Base increments are for "Easy" difficulty; scaled for Medium/Hard later.

export const journeyTemplate = [
    { id: 'diagram-building', name: "Diagram Building", duration: 2, dependencies: [], isApproval: false },
    { id: 'content-creation', name: "Content Creation", duration: 2, dependencies: [], isApproval: false },
    { id: 'creative-dev', name: "Creative Development", duration: 2, dependencies: [], isApproval: false },
    { id: 'initial-email', name: "Initial Email Template (Zoho)", duration: 2, dependencies: ["creative-dev"], isApproval: false },
    { id: 'pm-approval', name: "PM Approval", duration: 1, dependencies: [], isApproval: true },
    { id: 'sheetal-approval', name: "Sheetal Approval", duration: 1, dependencies: ["pm-approval"], isApproval: true },
    { id: 'paolo-approval', name: "Paolo Approval", duration: 1, dependencies: ["sheetal-approval"], isApproval: true },
    { id: 'denis-approval', name: "Denis Approval", duration: 1, dependencies: ["paolo-approval"], isApproval: true },
    { id: 'zoho-workflow', name: "Zoho Workflow Building (Diagram)", duration: 2, dependencies: ["diagram-building", "pm-approval"], isApproval: false },
    { id: 'email-revision', name: "Email Template Revision (Zoho)", duration: 2, dependencies: ["creative-dev", "paolo-approval", "denis-approval"], isApproval: false },
    { id: 'workflow-logic', name: "Workflow Linking / Logic", duration: 2, dependencies: ["email-revision"], isApproval: false },
    { id: 'final-revision', name: "Final Template Revision", duration: 2, dependencies: ["denis-approval"], isApproval: false },
    { id: 'wrap-up', name: "Project Wrap-Up & Check-In", duration: 2, dependencies: [], isApproval: false }
  ];
  