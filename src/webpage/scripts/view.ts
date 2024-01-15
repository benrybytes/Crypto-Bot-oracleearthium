window.onload = () => {
  // Get the search part of the URL (everything after the "?")
  const searchParams = new URLSearchParams(window.location.search);

  // Get a specific parameter by name
  const uidParam = searchParams.get("uid");
  const index = searchParams.get("index");

  console.log(`ID: ${uidParam}`);
  const res = fetch(
    `http://localhost:53134/card-data?uid${uidParam}&index=${index}`,
  )
    .then((result) => result.json())
    .then((response) => console.log(response));
};
