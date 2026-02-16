import { HttpServiceAxios, LocalStorageUtils } from "hyper-utils";

export class ApiService {
  static async call(path, method = "get", data = {}, headers = {}) {
    let actualHeaders = {
      Authorization: LocalStorageUtils.lsGet("authToken"),
      ...headers,
    };

    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    let result;
    if (method === "get") {
      result = await HttpServiceAxios.get(url, actualHeaders);
    } else {
      result = await HttpServiceAxios[method](url, data, actualHeaders);
    }
    if (headers?.raw) {
      return result;
    }

    return result?.data?.data;
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
