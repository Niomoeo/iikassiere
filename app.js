let MENU_PRICE = 0; // globale Konstante für den Menu-Preis

async function loadTopButtons(jsonUrl) {
    try {
        const response = await fetch(jsonUrl);
        const items = await response.json();

        const topList = document.querySelector('.top ul');
        topList.innerHTML = ''; // vorher löschen

        items.forEach(item => {
            // Wenn Item Menu ist, Preis in globale Konstante speichern
            if(item.name.toLowerCase() == 'menu') {
                MENU_PRICE = item.price;
            }

            const li = document.createElement('li');
            const button = document.createElement('button');

            const divTop = document.createElement('div');
            divTop.className = 'button-top';
            divTop.innerHTML = `
                <span class="name-button">${item.name}</span>
                <span class="description-button">${item.description}</span>
            `;

            const spanPrice = document.createElement('span');
            spanPrice.className = 'prize-button';
            spanPrice.textContent = `${item.price} CHF`;

            button.appendChild(divTop);
            button.appendChild(spanPrice);

            // Klick-Event für Site1 hinzufügen
            button.addEventListener('click', () => {
                const existing = cart.find(i => i.name === item.name);
                if(existing){
                    existing.count++;
                } else {
                    cart.push({ name: item.name, price: item.price, count: 1, fixed: false });
                }
                updateBottom();
            });

            li.appendChild(button);
            topList.appendChild(li);
        });

        // Menu initial als fixed Item in cart hinzufügen, falls noch nicht vorhanden
        const menuItem = cart.find(i => i.name.toLowerCase() === 'menu');
        if(!menuItem) {
            cart.unshift({ name: 'Menu', price: MENU_PRICE, count: 0, fixed: true });
        }

        updateBottom(); // sofort rendern

    } catch (error) {
        console.error('Fehler beim Laden der Items:', error);
    }
}

// JSON-Datei laden und Buttons generieren
loadTopButtons('items.json');

/* --- globale Datenstruktur --- */
// Menu steht immer am Anfang
let cart = [
];

/* --- Hilfsfunktion: Warenkorb aktualisieren (Site1) --- */
function updateBottom() {
    const bottomContent = document.querySelector('.bottom-content');
    bottomContent.innerHTML = '';

    cart.forEach(item => {
        // fixed Items (Menu) immer anzeigen, andere nur wenn count>0
        if(item.fixed || item.count > 0){
            const row = document.createElement('div');
            row.className = 'bottom-row';

            const left = document.createElement('div');
            left.className = 'left';
            left.innerHTML = `<span class="count">${item.count}x</span><span class="item-name">${item.name}</span>`;

            const right = document.createElement('div');
            right.className = 'right';
            const totalPrice = item.price * item.count;
            right.innerHTML = `<span class="prize">${totalPrice} CHF</span>`;

            const minusButton = document.createElement('button');
            minusButton.textContent = '-';
            minusButton.addEventListener('click', () => {
                if(item.count > 0) item.count--;
                if(!item.fixed && item.count === 0){
                    cart = cart.filter(i => i !== item); // komplett entfernen
                }
                updateBottom();
            });
            right.appendChild(minusButton);

            row.appendChild(left);
            row.appendChild(right);
            bottomContent.appendChild(row);
        }
    });
}

/* --- Top-Buttons klicken (Site1) --- */
document.querySelectorAll('.top li button').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.querySelector('.name-button').textContent;
        const priceText = button.querySelector('.prize-button').textContent;
        const price = parseInt(priceText.replace('CHF','').trim());

        const existing = cart.find(i => i.name === name);
        if(existing){
            existing.count++;
        } else {
            cart.push({name: name, price: price, count: 1, fixed: false});
        }
        updateBottom();
    });
});

/* --- Site2 anzeigen --- */
function showSite2() {
    document.getElementById('site1').hidden = true;
    document.getElementById('site2').hidden = false;

    const invoiceList = document.querySelector('.invoice-list');
    invoiceList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        if(item.count > 0){
            const line = document.createElement('div');
            line.className = 'invoice-item';
            const totalPrice = item.price * item.count;
            line.innerHTML = `<span>${item.count}x ${item.name}</span><span>${totalPrice} CHF</span>`;
            invoiceList.appendChild(line);
            total += totalPrice;
        }
    });

    document.querySelector('.sum-line span:last-child').textContent = `${total} CHF`;
}

/* --- Site1 wieder anzeigen --- */
function showSite1() {
    document.getElementById('site2').hidden = true;
    document.getElementById('site1').hidden = false;
    updateBottom();
}

/* --- Neue Rechnung (Site2) --- */
document.querySelector('.new-button').addEventListener('click', () => {
    cart.forEach(item => item.count = 0);
    showSite1();
});

// initial rendern
updateBottom();
