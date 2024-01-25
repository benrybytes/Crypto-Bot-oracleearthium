import IPostResponse from "../interfaces/post_response.interface";
declare function makePostRequest<T, U>(url: string, dataToSend: U): Promise<IPostResponse<T>>;
export default makePostRequest;
