declare function makeFetchRequest<T>(url: string): Promise<[Promise<T> | null, Error | null]>;
export default makeFetchRequest;
