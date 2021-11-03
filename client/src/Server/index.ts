import qs from "qs";

const baseUrl = "http://127.0.0.1:12357/";

const fetchData = (url: string, params: { [key: string]: string } = {}) => {
  const getUrl =
    baseUrl + url + (url.includes("?") ? "&" : "?") + qs.stringify(params);
  return new Promise((resolve, reject) => {
    fetch(getUrl)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};
