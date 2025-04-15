import { HttpServiceAxios } from "hyper-utils";

export class ApiService {
  static call(path, method = "get", data = {}, options = {}) {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    return HttpServiceAxios[method](url, data, options);
  }
}
