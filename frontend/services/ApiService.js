import { HttpServiceAxios, LocalStorageUtils } from "hyper-utils";

export class ApiService {
  static call(path, method = "get", data = {}, headers = {}) {
    let actualHeaders = {
      Authorization: LocalStorageUtils.lsGet("authToken"),
      ...headers,
    };

    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    if (method === "get") {
      return HttpServiceAxios.get(url, actualHeaders);
    }
    return HttpServiceAxios[method](url, data, actualHeaders);
  }

  static callWithFormData(path, formData) {
    let actualHeaders = {
      Authorization: LocalStorageUtils.lsGet("authToken"),
      "Content-Type": "multipart/form-data",
    };
    return HttpServiceAxios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`,
      formData,
      actualHeaders
    );
  }
}
