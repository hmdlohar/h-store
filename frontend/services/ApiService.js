import { HttpServiceAxios, LocalStorageUtils } from "hyper-utils";
import posthog from "posthog-js";

export class ApiService {
  static getPostHogDistinctId() {
    if (typeof window !== "undefined" && posthog) {
      return posthog.get_distinct_id();
    }
    return null;
  }

  static async call(path, method = "get", data = {}, headers = {}) {
    let actualHeaders = {
      Authorization: LocalStorageUtils.lsGet("authToken"),
      "x-ph-distinct-id": this.getPostHogDistinctId(),
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
      "x-ph-distinct-id": this.getPostHogDistinctId(),
    };
    return HttpServiceAxios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`,
      formData,
      actualHeaders
    );
  }
}
