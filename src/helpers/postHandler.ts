import IPostResponse from "../interfaces/post_response.interface";

// Content we want to send to server
const requestHeaders: HeadersInit = new Headers();
requestHeaders.set("Content-Type", "application/json");

/*
    Dynamic function accepting multiple data types for request to send to 
    Pre Condition: Take in a generic containing the data we get from the request and the type of data we want to send to the server 
    Post Condition: The datatype U gets sent back to client as a promise with the data if any to handle

    @param url - The url we want to handle the request to
*/
async function makePostRequest<T, U>(
  url: string,
  dataToSend: U,
): Promise<IPostResponse<T>> {
  try {
    const response: Response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ ...dataToSend }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    return { data_response: Promise.resolve(data), error: null };
  } catch (error: any) {
    console.error("Error making fetch request:", error);
    return { data_response: null, error: null };
  }
}
export default makePostRequest;
