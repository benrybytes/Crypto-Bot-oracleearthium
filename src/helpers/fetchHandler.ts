async function makeFetchRequest<T>(
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
export default makeFetchRequest;
