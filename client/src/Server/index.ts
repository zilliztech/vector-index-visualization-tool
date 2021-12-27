import { IVisRes } from "Types";

const baseUrl = "http://127.0.0.1:12357/";

const fetchData = (
  url: string,
  params: { [key: string]: string | number | object } = {}
) => {
  const getUrl =
    baseUrl +
    url +
    (url.includes("?") ? "&" : "?") +
    Object.keys(params)
      .map((key: string) => `${key}=${JSON.stringify(params[key])}`)
      .join("&");
  return new Promise((resolve, reject) => {
    fetch(getUrl)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

export const set_data = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const url = baseUrl + "set_data";
  return fetch(url, {
    body: form,
    method: "POST",
  }).then((res) => res.json());
};

export const set_index_type = (index_type: string) => {
  const url = "set_index_type";
  return fetchData(url, {
    index_type,
  });
};

export const set_index_build_params = (
  params: { [key: string]: string | number } = {}
) => {
  const url = "set_build_params";
  return fetchData(url, { params });
};

export const set_index_search_params = (
  params: { [key: string]: string | number } = {}
) => {
  const url = "set_search_params";
  return fetchData(url, { params });
};

export const set_index_vis_params = (
  params: { [key: string]: string | number } = {}
) => {
  const url = "set_vis_params";
  return fetchData(url, { params });
};

export const search_by_id = (id: number) => {
  const url = "search_by_id";
  return fetchData(url, {
    id,
  }) as Promise<IVisRes>;
};

export const get_vectors_count = () => {
  const url = "get_vectors_count";
  return fetchData(url) as Promise<{ count?: number }>;
};

export const get_image_url = (name: string | number) =>
  baseUrl + "image_id/" + name;
