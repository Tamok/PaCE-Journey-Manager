/**
 * timeline.js
 *
 * Renders the timeline for top-level journeys with drag-and-drop reordering.
 * Each timeline bubble shows the scheduled start date (month/year) with a tooltip for the full date.
 * It displays an indicator showing if the journey is overdue (if not complete) or if it was completed early/late.
 * Drag-and-drop applies a dashed border effect (via the "drop-dash" class) to indicate valid drop targets.
 *
 */

import { toYMD, scheduleJourneys } from "./scheduler.js";

export function renderTimeline(journeyData, timelineContainer, renderDetailsCallback) {
  // Recalculate scheduled dates for all journeys.
  scheduleJourneys(journeyData);
  timelineContainer.innerHTML = "";

  journeyData.forEach((j, index) => {
    // Only render top-level journeys.
    if (j.parentId) return;

    const item = document.createElement("div");
    item.classList.add("timeline-item");

    // Apply classes based on status and priority.
    if (j.completedDate) item.classList.add("completed");
    if (j.priority === "Critical") item.classList.add("critical");
    else if (j.priority === "Important") item.classList.add("important");
    else if (j.priority === "Next") item.classList.add("next");
    else if (j.priority === "Sometime Maybe") item.classList.add("maybe");

    // Allow dragging only if not completed.
    if (!j.completedDate) {
      item.setAttribute("draggable", "true");
    }

    // Display using the updated scheduledStartDate.
    const startDate = j.scheduledStartDate ? new Date(j.scheduledStartDate) : null;
    const startStr = startDate
      ? startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "";
    const fullDate = startDate
      ? startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "";

    // Build indicator text.
    let indicators = "";
    const today = new Date();
    if (!j.completedDate && j.initialEndDate) {
      const plannedEnd = new Date(j.initialEndDate);
      if (today > plannedEnd) {
        const overdueDays = Math.floor((today - plannedEnd) / (24 * 3600 * 1000));
        indicators += ` <span style="color:red;">(${overdueDays} days over)</span>`;
      }
    }
    if (j.completedDate && j.initialEndDate && j.scheduledEndDate) {
      const plannedEnd = new Date(j.initialEndDate);
      const actualEnd = new Date(j.scheduledEndDate);
      const diff = plannedEnd - actualEnd; // positive: early; negative: late.
      if (diff > 0) {
        const earlyDays = Math.floor(diff / (24 * 3600 * 1000));
        indicators += ` <span style="color:green;">(${earlyDays} days early)</span>`;
      } else if (diff < 0) {
        const lateDays = Math.floor(Math.abs(diff) / (24 * 3600 * 1000));
        indicators += ` <span style="color:red;">(${lateDays} days late)</span>`;
      }
    }

    item.innerHTML = `
      <strong>${j.title}</strong>
      <span style="font-size:0.85rem;" title="${fullDate}">${startStr}</span>
      ${indicators}
    `;

    // Click event to render journey details.
    item.addEventListener("click", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderDetailsCallback(index);
    });

    // Drag-and-drop with dashed border effect.
    item.addEventListener("dragstart", (e) => {
      if (j.completedDate) {
        e.preventDefault();
        return;
      }
      timelineContainer.dragSrcEl = item;
      e.dataTransfer.effectAllowed = "move";
      console.log(`Started dragging journey "${j.title}".`);
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drop-dash");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drop-dash");
    });

    item.addEventListener("drop", async (e) => {
      e.stopPropagation();
      item.classList.remove("drop-dash");
      const dragSrcEl = timelineContainer.dragSrcEl;
      if (dragSrcEl !== item) {
        const children = [...timelineContainer.children];
        const fromIndex = children.indexOf(dragSrcEl);
        const toIndex = children.indexOf(item);
        const movedJourney = journeyData[fromIndex];
        if (movedJourney.completedDate) {
          console.log(`Journey "${movedJourney.title}" is completed and cannot be moved.`);
          return;
        }
        // Reorder journeyData.
        const [moved] = journeyData.splice(fromIndex, 1);
        journeyData.splice(toIndex, 0, moved);
        journeyData.forEach((journey, idx) => { journey.order = idx; });
        if (toIndex > 0) {
          moved.priority = journeyData[toIndex - 1].priority;
        } else if (journeyData.length > 1) {
          moved.priority = journeyData[1].priority;
        }
        console.log(`Reordered journey "${moved.title}" from ${fromIndex} to ${toIndex} with new priority ${moved.priority}.`);
        renderTimeline(journeyData, timelineContainer, renderDetailsCallback);
        item.classList.add("active");
        renderDetailsCallback(toIndex);
      }
    });

    item.addEventListener("dragend", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("drop-dash"));
    });

    timelineContainer.appendChild(item);
  });
}
