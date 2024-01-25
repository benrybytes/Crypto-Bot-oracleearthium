import IPostResponse from "../interfaces/post_response.interface";
declare function makeGetRequest<T>(url: string): Promise<IPostResponse<T>>;
export default makeGetRequest;
