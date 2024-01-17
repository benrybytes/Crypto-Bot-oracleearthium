import IPostResponse from "../interfaces/post_response.interface";

// Content we want to send to server
const requestHeaders: HeadersInit = new Headers();
requestHeaders.set("Content-Type", "application/json");

/*
    Pre Condition: Take in a generic to check what what data is expected to be received
    Post Condition: The data is returned from the request and parsed to json 
    @param url - The url we want to handle the request to
*/
async function makeGetRequest<T>(url: string): Promise<IPostResponse<T>> {
  try {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log("response: ", response);
    const data = await response.json();
    console.log("DDDATA: ", data);
    return { data_response: Promise.resolve(data), error: null };
  } catch (error: any) {
    console.error("Error making fetch request:", error);
    return { data_response: null, error: null };
  }
}
export default makeGetRequest;
