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
  intestines: `${ICONS_ROOT}/stomach.svg`,
};

function mapMeatTypeToIcon(item) {
  const meatType = (item.meatType || [])[0];
  const typeIcon = MEAT_TYPE_ICONS_MAP[meatType];
  return typeIcon ? $icon(typeIcon, 'icon-header') : '';
}

function $icon(icon, className = 'icon') {
  return `<img src="${icon}" class="${className}" />`;
}

function $itemContent(item) {
  return `
    <div class="item-content">
      <h1 class="item-header">
        ${mapMeatTypeToIcon(item)} ${item.name}
      </h1>
      <div class="item-details">
        <div>${$icon(ICON_PACKAGE)} ${item.amount}</div>
        ${item.size ? `<div>${$icon(ICON_SCALE)} ${item.size}</div>` : ''}
        <div>${$icon(ICON_SNOWFLAKE)} ${item.date}</div>
      </div>
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

async function freezerItems($container) {
  try {
    const freezerItems = await (await fetch('/api/freezer')).json();
    const formattedItems = freezerItems.items.map(to$Item);
    $container.innerHTML = formattedItems.join('');
  } catch (err) {
    alert('Nie udało się pobrać szuflady: ' + err.message);
  }
}

async function onRemoveFreezerItemClicked(event) {
  event.target.disabled = true;
  const itemId = event.target.dataset.itemId;
  if (!itemId) {
    return;
  }
  try {
    const updatedItem = await (
      await fetch('/api/freezer', {
        method: 'PATCH',
        body: JSON.stringify({ id: itemId }),
      })
    ).json();
    const $item = document.querySelector(`#${itemId}`);
    if (updatedItem.amount <= 0) {
      $item.parentNode.removeChild($item);
      return;
    }
    $item.innerHTML = $itemContent(updatedItem);
  } catch (err) {
    alert('Nie udało się wyjąć z szyflady: ' + err.message);
  } finally {
    event.target.disabled = true;
  }
}

async function runApp() {
  const $freezerList = document.querySelector('#freezer');
  $freezerList.addEventListener('click', onRemoveFreezerItemClicked);
  await freezerItems($freezerList);
}

document.addEventListener('DOMContentLoaded', runApp);
