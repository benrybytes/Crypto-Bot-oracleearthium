export default interface IPostResponse<T> {
  data_response: Promise<T> | null;
  error: Error | null;
}
