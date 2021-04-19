"use strict";

const ICONS_ROOT = "/assets/icons";
const ICON_PACKAGE = `${ICONS_ROOT}/package.svg`;
const ICON_TAKE_OUT = `${ICONS_ROOT}/pet-bowl.svg`;

const MEAT_TYPE_ICONS_MAP = {
  liver: `${ICONS_ROOT}/liver.svg`,
  meat: `${ICONS_ROOT}/meat.svg`,
  bones: `${ICONS_ROOT}/bones.svg`,
  offal: `${ICONS_ROOT}/offal.svg`,
  offalWithLiver: `${ICONS_ROOT}/offalWithLiver.svg`,
  supplements: `${ICONS_ROOT}/supplements.svg`,
};

const STATIC_ELEMENTS = {};

const API = (function () {
  async function takePackageFromFreezer(id) {
    try {
      const response = await fetch("/api/freezer", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      return response.json();
    } catch {
      return null;
    }
  }

  async function fetchFreezerContent() {
    const response = await fetch("/api/freezer");
    return response.json();
  }

  async function fetchFreezerItemTypes() {
    const response = await fetch("/api/item-types");
    return response.json();
  }

  return {
    takePackageFromFreezer,
    fetchFreezerContent,
    fetchFreezerItemTypes,
  };
})();

function mapMeatTypeToIcon(type, iconClass = "icon-header") {
  const typeIcon = MEAT_TYPE_ICONS_MAP[type];
  return typeIcon ? $icon(typeIcon, iconClass) : "";
}

function $icon(icon, className = "icon") {
  return `<img src="${icon}" class="${className}" />`;
}

function $itemContent(item) {
  return `
    <div class="item-content">
      <div class="item-details">
        ${mapMeatTypeToIcon(item.meatType)} 
        <div>
          ${$icon(ICON_PACKAGE)} <span class="amount">${item.amount}</span>
        </div>
      </div>
      <h1 class="item-header">
        ${item.name}
      </h1>
    </div>
    <button type="button" data-item-id="${
      item.id
    }" class="item-take-out">${$icon(ICON_TAKE_OUT, "")}</button>`;
}

function to$Item(item) {
  return `<li id="${item.id}" class="item">
        ${$itemContent(item)}
      </li>`;
}

function to$ItemGroup([key, { name, items }]) {
  const header = `
  <h3>
    <hr/>
    <button type="button" class="group-header" data-group-id="${key}">${name}</button>
    </h3>
  `;
  return `<li>${header}<ul id="${key}">${items
    .map(to$Item)
    .join("")}</ul></div>`;
}

function refreshData() {
  STATIC_ELEMENTS.loader.classList.add("visible");
  STATIC_ELEMENTS.error.classList.remove("visible");
  STATIC_ELEMENTS.list.innerHTML = "";
  STATIC_ELEMENTS.header.innerHTML = "";
  Promise.all([API.fetchFreezerContent(), API.fetchFreezerItemTypes()])
    .then(([groups, types]) => {
      STATIC_ELEMENTS.header.innerHTML = types
        .map(
          ({ type }) =>
            `<div>${mapMeatTypeToIcon(type, "")} ${
              groups[type]?.amount ?? 0
            }</div>`
        )
        .join("");
      STATIC_ELEMENTS.list.innerHTML = Object.entries(groups)
        .map(to$ItemGroup)
        .join("");
      STATIC_ELEMENTS.loader.classList.remove("visible");
    })
    .catch((error) => {
      STATIC_ELEMENTS.loader.classList.remove("visible");
      STATIC_ELEMENTS.error.classList.add("visible");
    });
}

async function onRemoveFreezerItemClicked($button) {
  const itemId = $button.dataset.itemId;
  if (!itemId) {
    return;
  }
  $button.disabled = true;
  const updatedItem = await API.takePackageFromFreezer(itemId);
  if (!updatedItem) {
    return;
  }
  const $item = document.querySelector(`#${itemId}`);
  if (updatedItem.amount <= 0) {
    $item.parentNode.removeChild($item);
    const $group = document.querySelector(`#${updatedItem.meatType}`);
    const $lis = $group.querySelector(`li`);
    if (!$lis) {
      $group.remove();
    }
    return;
  }
  const $amount = $item.querySelector(".amount");
  $amount.innerHTML = updatedItem.amount;
  $button.disabled = false;
}

function onToggleGroup($button) {
  const groupId = $button.dataset.groupId;
  if (!groupId) {
    return;
  }
  STATIC_ELEMENTS.list
    .querySelector(`#${groupId}`)
    .classList.toggle("group__collapsed");
}

async function onButtonClicked(event) {
  const $button = event.target.closest("button");
  if (!$button) {
    return;
  }
  if ($button.classList.contains("item-take-out")) {
    onRemoveFreezerItemClicked($button);
    return;
  }
  if ($button.classList.contains("group-header")) {
    onToggleGroup($button);
    return;
  }
}

async function runApp() {
  STATIC_ELEMENTS.header = document.querySelector(".types");
  STATIC_ELEMENTS.loader = document.querySelector("#loading");
  STATIC_ELEMENTS.error = document.querySelector("#error");
  STATIC_ELEMENTS.list = document.querySelector("#freezer");

  STATIC_ELEMENTS.list.addEventListener("click", onButtonClicked);
  const $refreshButton = document.querySelectorAll(".refresh-btn");
  $refreshButton.forEach((b) => b.addEventListener("click", refreshData));
  refreshData();
}

document.addEventListener("DOMContentLoaded", runApp);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
