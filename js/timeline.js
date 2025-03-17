/**
 * timeline.js
 *
 * Handles rendering of the timeline, drag and drop reordering,
 * and binding events to each journey timeline item.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

import { toYMD, getNextBusinessDay, addDays } from "./scheduler.js";
import { scheduleJourneys } from "./scheduler.js";

export function renderTimeline(journeyData, timelineContainer, renderDetailsCallback) {
  // Update scheduling before rendering.
  scheduleJourneys(journeyData);
  timelineContainer.innerHTML = ""; // Clear the container.

  journeyData.forEach((j, index) => {
    // Optionally skip child journeys in the main timeline.
    if (j.priority === "Child") return;

    const item = document.createElement("div");
    item.classList.add("timeline-item");

    // Apply styling classes based on priority.
    if (j.priority === "Critical") {
      item.classList.add("critical");
    } else if (j.priority === "Important") {
      item.classList.add("important");
    } else if (j.priority === "Next") {
      item.classList.add("next");
    } else if (j.priority === "Sometime Maybe") {
      item.classList.add("maybe");
    }
    if (j.completedDate) item.classList.add("completed");

    item.setAttribute("draggable", "true");

    const monthYear = j.startDate ? j.startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    const dateRange = (j.startDate && j.endDate) ? `${toYMD(j.startDate)} – ${toYMD(j.endDate)}` : "";
    item.innerHTML = `<strong>${j.title}</strong><span>${monthYear}<br>${dateRange}</span>`;

    // When clicked, render the details view.
    item.addEventListener("click", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderDetailsCallback(index);
    });

    // Drag and drop event handlers.
    item.addEventListener("dragstart", e => {
      timelineContainer.dragSrcEl = item;
      e.dataTransfer.effectAllowed = "move";
      console.log(`Drag started for journey "${j.title}".`);
    });
    item.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drop-target");
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("drop-target");
    });
    item.addEventListener("drop", e => {
      e.stopPropagation();
      item.classList.remove("drop-target");
      const dragSrcEl = timelineContainer.dragSrcEl;
      if (dragSrcEl !== item) {
        const children = [...timelineContainer.children];
        const fromIndex = children.indexOf(dragSrcEl);
        const toIndex = children.indexOf(item);
        const [moved] = journeyData.splice(fromIndex, 1);
        journeyData.splice(toIndex, 0, moved);
        // Set explicit ordering.
        journeyData.forEach((journey, idx) => {
          journey.order = idx;
        });
        console.log(`Reordered journey "${moved.title}" from position ${fromIndex} to ${toIndex}.`);
        // Re-render timeline and details.
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
