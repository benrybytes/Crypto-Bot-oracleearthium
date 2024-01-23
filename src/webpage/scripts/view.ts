import {
  CryptoData,
  CryptoCurrency,
} from "../../interfaces/cryptoresponse.interface.";
import {
  DiscordServer,
  DiscordServerResponse,
} from "../../interfaces/discord_server.interface";

window.onload = async () => {
  async function fetchfromclient<T>(
    url: string,
  ): Promise<[Promise<T> | null, Error | null]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text(); // Get the raw text of the response

      const data = JSON.parse(text); // Try to parse JSON from the response text
      return [Promise.resolve(data), null];
    } catch (error: any) {
      console.error("Error making fetch request:", error);
      return [null, error];
    }
  }

  // Get the search part of the URL (everything after the "?")
  const searchParams = new URLSearchParams(window.location.search);

  // Get a specific parameter by name
  const uidParam = searchParams.get("uid");
  const index = searchParams.get("index");

  const coinLimit = 50;
  const develop = true;
  try {
    const [serverResponse, error] =
      await fetchfromclient<DiscordServerResponse>(
        develop
          ? `https://crypto-bot-oracleearthium-henrymartinez8.replit.app/card-data?uid=${uidParam}&index=${index}`
          : `https://5aa7f1be-5b28-426d-a19e-7644c70e62d6-00-2r5mdvjrv6zn2.kirk.replit.dev/card-data?uid=${uidParam}&index=${index}`,
      );

    if (error) {
      throw new Error(`Error fetching Discord server data: ${error}`);
    }

    const [topCoinsResponse, crypto_error] = await fetchfromclient<CryptoData>(
      `https://api.coincap.io/v2/assets?limit=${coinLimit}`,
    );
    console.log(topCoinsResponse);

    if (crypto_error) {
      throw new Error(`Error fetching top coins data: ${crypto_error}`);
    }

    // Be able to get data from chaining the response to get the data we need by unwrapping it

    const server_data: DiscordServer = await serverResponse!.then(
      (res) => res.servers[0],
    );
    const top_coins: CryptoCurrency[] = await topCoinsResponse!.then(
      (res) => res.data,
    );

    const header = document.getElementById("header");
    const memberCount = document.getElementById("member-count");
    const coinList = document.getElementById("coin-list")!;
    const coinChosen = document.getElementById("coin-chosen")!;

    header!.innerText = `Server: ${server_data.name}`;
    memberCount!.innerText = `Members: ${server_data.members.length}`;

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

    const insertChildAtIndex = (
      parent: Element,
      child: ChildNode,
      index: number,
    ) => {
      if (!index) index = 0;
      if (index >= parent.children.length) {
        parent.appendChild(child);
      } else {
        parent.insertBefore(child, parent.children[index]);
      }
    };

    interface IGetCryptoResponse {
      serverId: string;
      coinData: CryptoCurrency[];
    }

    // Client-Side JavaScript
    const baseURL: string = "https://crypto-bot-oracleearthium-henrymartinez8.replit.app";
    const cryptoURL: string = baseURL + "/crypto";

    const [getCoinsResponse, errorGettingCoins] = await fetchfromclient<
      IGetCryptoResponse[]
    >(cryptoURL + "/get-crypto?serverId=" + server_data.id);

    console.log(cryptoURL + "/get-crypto?serverId=" + server_data.id)
    if (errorGettingCoins) {
      console.error(errorGettingCoins);
      return;
    }

    let coinData: IGetCryptoResponse = await getCoinsResponse!.then(
      (res: IGetCryptoResponse[]) => res[0],
    );
    console.log(coinData)
    let coinsChosenList: CryptoCurrency[] =
      coinData.coinData.length != 0 ? coinData.coinData : [];
    console.log(coinsChosenList);
    let filteredCoins = top_coins;
    console.log(filteredCoins);
    // Filter out the coins that were selected to the coins selection list
    // Assuming top_coins is an array of CryptoCurrency objects
    if (coinsChosenList.length !== 0) {
      const coinsChosenSet = new Set(coinsChosenList.map((coin) => coin.id));
      filteredCoins = top_coins.filter(
        (topCoin) => !coinsChosenSet.has(topCoin.id),
      );
    }

    const moveToChoose = async (
      e: any,
      location: number,
      element: HTMLDivElement,
      coin: CryptoCurrency,
      toggle: boolean,
    ) => {
      e.preventDefault();

      const buttonFromElement: HTMLButtonElement = element
        .children[1] as HTMLButtonElement;

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
        } catch (error) {
          console.error("Error updating coin list:", error);
        }
      } else {
        insertChildAtIndex(coinList, element, location);
        buttonFromElement.className = "select-button";

        coinsChosenList = coinsChosenList.filter(
          (coinElement: CryptoCurrency) => coinElement.id !== coin.id,
        );

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
        } catch (error) {
          console.error("Error updating coin list:", error);
        }

        console.log(coinsChosenList.length);
      
    };

  } 

    // Initialize crypto currency lists ready to be used
    for (let i = 0; i < coinsChosenList.length; i++) {
      const { createButton, createContainer, createText, textContainer } =
        createLabelCoin();
      createText.innerText = coinsChosenList[i].name;
      createButton.innerText = "remove";
      textContainer.className = "content";

      createButton.className = "remove-button";
      createContainer.className = "crypto-container";
      coinChosen.appendChild(createContainer);

      createButton.addEventListener(
        "click",
        (function(currentToggle) {
          return function(e: any) {
            moveToChoose(
              e,
              i,
              createContainer,
              coinsChosenList[i],
              currentToggle,
            );
            currentToggle = !currentToggle;
          };
        })(false),
      );
    }

    // Initialize crypto currency lists ready to be used
    for (let i = 0; i < filteredCoins.length; i++) {
      const { createButton, createContainer, createText, textContainer } =
        createLabelCoin();
      createText.innerText = filteredCoins[i].name;
      createButton.innerText = "select";
      textContainer.className = "content";

      createButton.className = "select-button";
      createContainer.className = "crypto-container";
      coinList.appendChild(createContainer);

      createButton.addEventListener(
        "click",
        (function(currentToggle) {
          return function(e: any) {
            moveToChoose(
              e,
              i,
              createContainer,
              filteredCoins[i],
              currentToggle,
            );
            currentToggle = !currentToggle;
          };
        })(true),
      );
    }
    // Further processing...

}
  catch (e) {
    console.error("Error:", e);
  }

};