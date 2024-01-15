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
      const data = await response.json();
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
  console.log("hello");
  try {
    const [serverResponse, error] =
      await fetchfromclient<DiscordServerResponse>(
        `http://localhost:53134/card-data?uid=${uidParam}&index=${index}`,
      );

    if (error) {
      throw new Error(`Error fetching Discord server data: ${error}`);
    }

    const [topCoinsResponse, crypto_error] = await fetchfromclient<CryptoData>(
      `https://api.coincap.io/v2/assets?limit=${coinLimit}`,
    );

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

    console.log("Server data: " + JSON.stringify(server_data));
    console.log("Top coins: " + JSON.stringify(top_coins));

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

    let coinsChosenList: CryptoCurrency[] = [];

    const moveToChoose = (
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
      } else {
        insertChildAtIndex(coinList, element, location);
        buttonFromElement.className = "select-button";

        coinsChosenList = coinsChosenList.filter(
          (coinElement: CryptoCurrency) => coinElement.id !== coin.id, // Keep coins that do not have the coin id we want to remove
        );
        console.log(coinsChosenList.length);
      }
    };

    // Initialize crypto currency lists ready to be used
    for (let i = 0; i < top_coins.length; i++) {
      const { createButton, createContainer, createText, textContainer } =
        createLabelCoin();
      createText.innerText = top_coins[i].name;
      createButton.innerText = "select";
      textContainer.className = "content";

      createButton.className = "select-button";
      createContainer.className = "crypto-container";
      coinList.appendChild(createContainer);

      let toggle = true;

      createButton.addEventListener("click", (e: any) => {
        moveToChoose(e, i, createContainer, top_coins[i], toggle);
        toggle = !toggle;
      });
    }

    // Further processing...
  } catch (e) {
    console.error("Error:", e);
  }
};
