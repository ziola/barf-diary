function formatAmount({ amount = 1 } = {}) {
  if (amount === 1) {
    return 'porcja';
  }
  if (amount < 5) {
    return 'porcje';
  }
  return 'porcji';
}

function create$ItemContent(item) {
  return `<div>
            <p>${item.name}</p>
            <p>${(item.meatTypeName ?? []).join(', ')}</p>
            <p>${item.amount} ${formatAmount(item)} ${
    item.size ? `po ${item.size} gram` : ''
  } z ${item.date}</p>
        </div>
        <button type="button" data-item-id="${item.id}"> -1</button>`;
}

function to$Item(item) {
  return `<li id="${item.id}">
        ${create$ItemContent(item)}
      </li>`;
}

async function freezerItems($container) {
  try {
    const freezerItems = await (await fetch('/api/freezer')).json();
    const formattedItems = freezerItems.items.map(to$Item);
    $container.innerHTML = formattedItems.join('');
  } catch (err) {
    alert('Nie udało się pobrać szyflady: ' + err.message);
  }
}

async function onNavigationButtonClicked(event) {
  if (event.target.id === 'add-to-freezer-btn') {
    const meatTypes = await (await fetch('/api/meat-types')).json();
    const $meatTypeSelect = document.querySelector('select#type');
    $meatTypeSelect.options.length = 0;
    const genericOption = new Option('Wybierz', '', true, true);
    genericOption.disabled = true;
    $meatTypeSelect.options.add(genericOption);
    meatTypes.forEach((meatType) => {
      $meatTypeSelect.options.add(
        new Option(meatType.name, meatType.id, false)
      );
    });
    const $addToFreezerModal = document.querySelector('#add-to-freezer-modal');
    const $addToFreezerModalActions = document.querySelector(
      '#add-to-freezer-modal-actions'
    );
    $addToFreezerModalActions
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = false));
    $addToFreezerModalActions.addEventListener(
      'click',
      onModalActionClicked($addToFreezerModal, $addToFreezerModalActions)
    );
    $addToFreezerModal.classList.add('open');
  }
}

function onModalActionClicked($modal, $buttonsContainer) {
  return async function onModalActionClicked(event) {
    $buttonsContainer.removeEventListener('click', this);
    if (event.target.id === 'close-btn') {
      $modal.classList.remove('open');
      return;
    }
    if (event.target.id === 'add-btn') {
      $buttonsContainer
        .querySelectorAll('button')
        .forEach((button) => (button.disabled = true));
      const name = document.querySelector('input#name').value;
      const amount = parseInt(document.querySelector('input#amount').value, 10);
      const size = parseInt(document.querySelector('input#size').value, 10);
      const type = document.querySelector('select#type').value;
      const date = new Date().toISOString().slice(0, 10);
      const createdItem = await (
        await fetch('/api/freezer', {
          method: 'POST',
          body: JSON.stringify({ name, amount, size, type, date }),
        })
      ).json();
      const $freezerList = document.querySelector('#freezer');
      const $newItem = document.createElement('li');
      $newItem.id = createdItem.id;
      $newItem.innerHTML = create$ItemContent(createdItem);
      $freezerList.append($newItem);
      $modal.classList.remove('open');
    }
  };
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
    $item.innerHTML = create$ItemContent(updatedItem.item);
  } catch (err) {
    alert('Nie udało się wyjąć z szyflady: ' + err.message);
  } finally {
    event.target.disabled = true;
  }
}

async function runApp() {
  const $freezerList = document.querySelector('#freezer');
  const $navigationBar = document.querySelector('#navigation');
  $freezerList.addEventListener('click', onRemoveFreezerItemClicked);
  $navigationBar.addEventListener('click', onNavigationButtonClicked);
  await freezerItems($freezerList);
}

document.addEventListener('DOMContentLoaded', runApp);
