type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT";

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: Record<string, unknown> | unknown[];
  header?: Record<string, string>;
  showLoading?: boolean;
}

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || "";

const buildUrl = (url: string) => {
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${getBaseUrl()}${url}`;
};

export function request<T = unknown>(options: RequestOptions) {
  const { showLoading = false, ...requestOptions } = options;

  if (showLoading) {
    uni.showLoading({ title: "Loading", mask: true });
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...requestOptions,
      url: buildUrl(requestOptions.url),
      method: requestOptions.method || "GET",
      success(response) {
        const statusCode = response.statusCode || 0;

        if (statusCode >= 200 && statusCode < 300) {
          resolve(response.data as T);
          return;
        }

        reject(new Error(`Request failed with status ${statusCode}`));
      },
      fail(error) {
        reject(error);
      },
      complete() {
        if (showLoading) {
          uni.hideLoading();
        }
      },
    });
  });
}
