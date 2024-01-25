"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestHeaders = new Headers();
requestHeaders.set("Content-Type", "application/json");
function makePostRequest(url, dataToSend) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(Object.assign({}, dataToSend)),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            return { data_response: Promise.resolve(data), error: null };
        }
        catch (error) {
            console.error("Error making fetch request:", error);
            return { data_response: null, error: null };
        }
    });
}
exports.default = makePostRequest;
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    function fetchfromclient(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = yield response.json();
                return [Promise.resolve(data), null];
            }
            catch (error) {
                console.error("Error making fetch request:", error);
                return [null, error];
            }
        });
    }
    const baseUrl = "apiBaseUrl";
    const cryptoUrl = baseUrl + "/crypto";
    // Get the search part of the URL (everything after the "?")
    const searchParams = new URLSearchParams(window.location.search);
    const resetButton = document.getElementById("reset-button");
    const resetText = document.getElementById("reset-header");
    // Get a specific parameter by name
    const uidParam = searchParams.get("uid");
    const index = searchParams.get("index");
    const pathSegments = window.location.pathname.split("/");
    const serverIdIndex = pathSegments.indexOf("card-page");
    let failedResponseInterval;
    if (serverIdIndex !== -1 && serverIdIndex < pathSegments.length - 1) {
        const serverId = pathSegments[serverIdIndex + 1];
        console.log("Card Page Number:", serverId);
        let failedResponseInterval;
        resetButton === null || resetButton === void 0 ? void 0 : resetButton.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            // Disable the button
            resetButton.disabled = true;
            try {
                const { data_response, error } = yield makePostRequest(baseUrl + `/discord-server/reset-leaderboard?serverId=${serverId}`, {});
                // Message that leaderboard was successfully reset
                const safeMessage = yield data_response.then((res) => res.message);
                // Display success message for 3 seconds
                resetText.innerText = safeMessage;
            }
            catch (error) {
                // Display error message for 3 seconds
                resetText.innerText = "Unsuccessful in reset";
            }
            finally {
                // Enable the button after 3 seconds
                failedResponseInterval = setInterval(() => {
                    clearInterval(failedResponseInterval);
                    resetText.innerText = "Reset Leaderboard";
                    resetButton.disabled = false;
                }, 3000);
            }
        }));
    }
    const coinLimit = 50;
    try {
        const [serverResponse, error] = yield fetchfromclient(`${baseUrl}/card-data?uid=${uidParam}&index=${index}`);
        if (error) {
            throw new Error(`Error fetching Discord server data: ${error}`);
        }
        const [topCoinsResponse, crypto_error] = yield fetchfromclient(`https://api.coincap.io/v2/assets?limit=${coinLimit}`);
        console.log(topCoinsResponse);
        if (crypto_error) {
            throw new Error(`Error fetching top coins data: ${crypto_error}`);
        }
        // Be able to get data from chaining the response to get the data we need by unwrapping it
        const server_data = yield serverResponse.then((res) => res.servers[0]);
        const top_coins = yield topCoinsResponse.then((res) => res.data);
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
        // Client-Side JavaScript
        const [getCoinsResponse, errorGettingCoins] = yield fetchfromclient(cryptoUrl + "/get-crypto?serverId=" + server_data.id);
        if (errorGettingCoins) {
            console.error(errorGettingCoins);
            return;
        }
        let coinData = yield getCoinsResponse.then((res) => res[0]);
        console.log(coinData);
        let coinsChosenList = coinData.coinData.length != 0 ? coinData.coinData : [];
        console.log(coinsChosenList);
        let filteredCoins = top_coins;
        console.log(filteredCoins);
        // Filter out the coins that were selected to the coins selection list
        // Assuming top_coins is an array of CryptoCurrency objects
        if (coinsChosenList.length !== 0) {
            const coinsChosenSet = new Set(coinsChosenList.map((coin) => coin.id));
            filteredCoins = top_coins.filter((topCoin) => !coinsChosenSet.has(topCoin.id));
        }
        const moveToChoose = (e, location, element, coin, toggle) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const buttonFromElement = element
                .children[1];
            if (toggle) {
                buttonFromElement.className = "remove-button";
                buttonFromElement.innerText = "remove";
                coinsChosenList.push(coin);
                coinChosen.appendChild(element);
                try {
                    yield fetch(cryptoUrl + "/update-coin-list", {
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
                    yield fetch(cryptoUrl + "/update-coin-list", {
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
        });
        // Initialize crypto currency lists ready to be used
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
        // Initialize crypto currency lists ready to be used
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
        // Further processing...
    }
    catch (e) {
        console.error("Error:", e);
    }
});
