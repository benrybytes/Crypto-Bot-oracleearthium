"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.onload = async () => {
    async function fetchfromclient(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const text = await response.text();
            const data = JSON.parse(text);
            return [Promise.resolve(data), null];
        }
        catch (error) {
            console.error("Error making fetch request:", error);
            return [null, error];
        }
    }
    const searchParams = new URLSearchParams(window.location.search);
    const uidParam = searchParams.get("uid");
    const index = searchParams.get("index");
    const coinLimit = 50;
    const develop = true;
    try {
        const [serverResponse, error] = await fetchfromclient(develop
            ? `https://crypto-bot-oracleearthium-henrymartinez8.replit.app/card-data?uid=${uidParam}&index=${index}`
            : `https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev/card-data?uid=${uidParam}&index=${index}`);
        if (error) {
            throw new Error(`Error fetching Discord server data: ${error}`);
        }
        const [topCoinsResponse, crypto_error] = await fetchfromclient(`https://api.coincap.io/v2/assets?limit=${coinLimit}`);
        console.log(topCoinsResponse);
        if (crypto_error) {
            throw new Error(`Error fetching top coins data: ${crypto_error}`);
        }
        const server_data = await serverResponse.then((res) => res.servers[0]);
        const top_coins = await topCoinsResponse.then((res) => res.data);
        const header = document.getElementById("header");
        const memberCount = document.getElementById("member-count");
        const coinList = document.getElementById("coin-list");
        const coinChosen = document.getElementById("coin-chosen");
        header.innerText = `Server: ${server_data.name}`;
        memberCount.innerText = `Members: ${server_data.members.length}`;
        const createLabelCoin = () => {
            const createText = document.createElement("p");
            const createButton = document.createElement("button");
            const createContainer = document.createElement("div");
            const textContainer = document.createElement("div");
            textContainer.appendChild(createText);
            createContainer.appendChild(textContainer);
            createContainer.appendChild(createButton);
            return { createButton, createContainer, createText, textContainer };
        };
        const insertChildAtIndex = (parent, child, index) => {
            if (!index)
                index = 0;
            if (index >= parent.children.length) {
                parent.appendChild(child);
            }
            else {
                parent.insertBefore(child, parent.children[index]);
            }
        };
        const baseURL = "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";
        const cryptoURL = baseURL + "/crypto";
        const [getCoinsResponse, errorGettingCoins] = await fetchfromclient(cryptoURL + "/get-crypto?serverId=" + server_data.id);
        console.log(cryptoURL + "/get-crypto?serverId=" + server_data.id);
        if (errorGettingCoins) {
            console.error(errorGettingCoins);
            return;
        }
        let coinData = await getCoinsResponse.then((res) => res[0]);
        console.log(coinData);
        let coinsChosenList = coinData.coinData.length != 0 ? coinData.coinData : [];
        console.log(coinsChosenList);
        let filteredCoins = top_coins;
        console.log(filteredCoins);
        if (coinsChosenList.length !== 0) {
            const coinsChosenSet = new Set(coinsChosenList.map((coin) => coin.id));
            filteredCoins = top_coins.filter((topCoin) => !coinsChosenSet.has(topCoin.id));
        }
        const moveToChoose = async (e, location, element, coin, toggle) => {
            e.preventDefault();
            const buttonFromElement = element
                .children[1];
            if (toggle) {
                buttonFromElement.className = "remove-button";
                buttonFromElement.innerText = "remove";
                coinsChosenList.push(coin);
                coinChosen.appendChild(element);
                try {
                    await fetch(cryptoURL + "/update-coin-list", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            serverId: server_data.id,
                            selectedCoins: coinsChosenList,
                        }),
                    });
                }
                catch (error) {
                    console.error("Error updating coin list:", error);
                }
            }
            else {
                insertChildAtIndex(coinList, element, location);
                buttonFromElement.className = "select-button";
                coinsChosenList = coinsChosenList.filter((coinElement) => coinElement.id !== coin.id);
                try {
                    await fetch(cryptoURL + "/update-coin-list", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            serverId: server_data.id,
                            selectedCoins: coinsChosenList,
                        }),
                    });
                }
                catch (error) {
                    console.error("Error updating coin list:", error);
                }
                console.log(coinsChosenList.length);
            }
            ;
        };
        for (let i = 0; i < coinsChosenList.length; i++) {
            const { createButton, createContainer, createText, textContainer } = createLabelCoin();
            createText.innerText = coinsChosenList[i].name;
            createButton.innerText = "remove";
            textContainer.className = "content";
            createButton.className = "remove-button";
            createContainer.className = "crypto-container";
            coinChosen.appendChild(createContainer);
            createButton.addEventListener("click", (function (currentToggle) {
                return function (e) {
                    moveToChoose(e, i, createContainer, coinsChosenList[i], currentToggle);
                    currentToggle = !currentToggle;
                };
            })(false));
        }
        for (let i = 0; i < filteredCoins.length; i++) {
            const { createButton, createContainer, createText, textContainer } = createLabelCoin();
            createText.innerText = filteredCoins[i].name;
            createButton.innerText = "select";
            textContainer.className = "content";
            createButton.className = "select-button";
            createContainer.className = "crypto-container";
            coinList.appendChild(createContainer);
            createButton.addEventListener("click", (function (currentToggle) {
                return function (e) {
                    moveToChoose(e, i, createContainer, filteredCoins[i], currentToggle);
                    currentToggle = !currentToggle;
                };
            })(true));
        }
    }
    catch (e) {
        console.error("Error:", e);
    }
};
