/**
 * timeline.js
 *
 * Renders the timeline for top-level journeys with drag-and-drop reordering.
 * Each timeline circle now shows only the month/year (formatted with weekday on hover),
 * along with the journey title.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

import { toYMD } from "./scheduler.js";
import { scheduleJourneys } from "./scheduler.js";

/**
 * Renders the timeline.
 * @param {Array} journeyData - Array of journey objects.
 * @param {HTMLElement} timelineContainer - DOM element for timeline.
 * @param {Function} renderDetailsCallback - Callback to render details.
 */
export function renderTimeline(journeyData, timelineContainer, renderDetailsCallback) {
  scheduleJourneys(journeyData);
  timelineContainer.innerHTML = "";
  journeyData.forEach((j, index) => {
    if (j.parentId) return;
    const item = document.createElement("div");
    item.classList.add("timeline-item");
    if (j.completedDate) item.classList.add("completed");
    // Apply priority class.
    if (j.priority === "Critical") item.classList.add("critical");
    else if (j.priority === "Important") item.classList.add("important");
    else if (j.priority === "Next") item.classList.add("next");
    else if (j.priority === "Sometime Maybe") item.classList.add("maybe");

    item.setAttribute("draggable", "true");

    // Only display month/year.
    const startStr = j.startDate ? new Date(j.startDate).toLocaleDateString("en-US", { month:"short", year:"numeric" }) : "";
    // On hover, show weekday as well.
    const hoverStr = j.startDate ? new Date(j.startDate).toLocaleDateString("en-US", { weekday:"short", month:"short", year:"numeric" }) : "";
    item.innerHTML = `
      <strong>${j.title}</strong>
      <span style="font-size:0.85rem;" title="${hoverStr}">${startStr}</span>
    `;
    item.addEventListener("click", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderDetailsCallback(index);
    });
    // Drag-and-drop events.
    item.addEventListener("dragstart", (e) => {
      timelineContainer.dragSrcEl = item;
      e.dataTransfer.effectAllowed = "move";
      console.log(`Started dragging journey "${j.title}".`);
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drop-target");
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("drop-target");
    });
    item.addEventListener("drop", async (e) => {
      e.stopPropagation();
      item.classList.remove("drop-target");
      const dragSrcEl = timelineContainer.dragSrcEl;
      if (dragSrcEl !== item) {
        const children = [...timelineContainer.children];
        const fromIndex = children.indexOf(dragSrcEl);
        const toIndex = children.indexOf(item);
        const [moved] = journeyData.splice(fromIndex, 1);
        journeyData.splice(toIndex, 0, moved);
        journeyData.forEach((journey, idx) => { journey.order = idx; });
        console.log(`Reordered journey "${moved.title}" from ${fromIndex} to ${toIndex}.`);
        renderTimeline(journeyData, timelineContainer, renderDetailsCallback);
        item.classList.add("active");
        renderDetailsCallback(toIndex);
      }
    });
    item.addEventListener("dragend", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("drop-target"));
    });
    timelineContainer.appendChild(item);
  });
}
