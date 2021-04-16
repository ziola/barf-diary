'use strict';


const ICONS_ROOT = '/assets/icons';
const ICON_SNOWFLAKE = `${ICONS_ROOT}/snowflake.svg`;
const ICON_PACKAGE = `${ICONS_ROOT}/package.svg`;
const ICON_SCALE = `${ICONS_ROOT}/scale.svg`;
const ICON_TAKE_OUT = `${ICONS_ROOT}/arrow-out.svg`;

const MEAT_TYPE_ICONS_MAP = {
  liver: `${ICONS_ROOT}/liver.svg`,
  meat: `${ICONS_ROOT}/meat.svg`,
  bones: `${ICONS_ROOT}/bones.svg`,
  vegetables: `${ICONS_ROOT}/vegetables.svg`,
  offal: `${ICONS_ROOT}/offal.svg`,
  offalWithLiver: `${ICONS_ROOT}/offalWithLiver.svg`,
  supplements: `${ICONS_ROOT}/supplements.svg`,
};

const API = function () {
  async function takePackageFromFreezer(id) {
    try {
      const response = await fetch('/api/freezer', {
        method: 'PATCH',
        body: JSON.stringify({ id }),
      });
      return response.json();
    } catch (err) {
      alert('Nie udało się pobrać szuflady: ' + err.message);
      return null;
    }
  }

  async function fetchFreezerContent() {
    try {
      const response = await fetch('/api/freezer')
      return response.json();
    } catch (err) {
      alert('Nie udało się pobrać szuflady: ' + err.message);
      return [];
    }
  }

  return {
    takePackageFromFreezer,
    fetchFreezerContent
  }
}();

function mapMeatTypeToIcon(item) {
  const meatType = item.meatType;
  const typeIcon = MEAT_TYPE_ICONS_MAP[meatType];
  return typeIcon ? $icon(typeIcon, 'icon-header') : '';
}

function $icon(icon, className = 'icon') {
  return `<img src="${icon}" class="${className}" />`;
}

function $itemContent(item) {
  return `
    <div class="item-content">
      <div class="item-details">
        ${mapMeatTypeToIcon(item)} 
        <div>
          ${$icon(ICON_PACKAGE)} <span class="amount">${item.amount}</span>
        </div>
      </div>
      <h1 class="item-header">
        ${item.name}
      </h1>
    </div>
    <button type="button" data-item-id="${item.id}">${$icon(
    ICON_TAKE_OUT,
    ''
  )}</button>`;
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
    <span>${name}</span>
    </h3>
  `;
  return `<div id="${key}">${header}<ul>${items.map(to$Item).join('')}</ul></div>`;
}

async function fetchFreezerContent($container) {
  const freezerItems = await API.fetchFreezerContent();
  $container.innerHTML = Object.entries(freezerItems.groupped).map(to$ItemGroup).join('');
}

async function onRemoveFreezerItemClicked(event) {
  const $button = event.target.closest('button');
  if (!$button) {
    return;
  }
  $button.disabled = true;
  const itemId = $button.dataset.itemId;
  if (!itemId) {
    return;
  }
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
  const $amount = $item.querySelector('.amount');
  $amount.innerHTML = updatedItem.amount;
  $button.disabled = false;
}

async function runApp() {
  const $freezerList = document.querySelector('#freezer');
  $freezerList.addEventListener('click', onRemoveFreezerItemClicked);
  await fetchFreezerContent($freezerList);
}

document.addEventListener('DOMContentLoaded', runApp);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}